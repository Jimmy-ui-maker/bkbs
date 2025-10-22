// src/app/api/results/[learnerId]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Result from "@/models/Result";
import Learner from "@/models/Learner";

function computeGrade(total) {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 45) return "D";
  if (total >= 40) return "E";
  return "F";
}

/**
 * POST: Add/update a subject score for a learner for a given session + term.
 * Schema assumed:
 * Result {
 *   learnerId,
 *   session: String,
 *   results: [
 *     { term: String, subjects: [{ subject, CA1, CA2, HF, Project, Exams, Total, Grade }] }
 *   ]
 * }
 */
export async function POST(req, { params }) {
  const { learnerId } = params;
  const body = await req.json();
  const {
    subject,
    term = "First Term",
    session = "2024/2025",
    force = false,
  } = body;

  if (!learnerId || !subject) {
    return NextResponse.json({
      success: false,
      error: "Learner ID and subject are required",
    });
  }

  try {
    await dbConnect();

    const learner = await Learner.findById(learnerId);
    if (!learner) {
      return NextResponse.json({ success: false, error: "Learner not found" });
    }

    // Find or create the session document for this learner
    let sessionDoc = await Result.findOne({ learnerId, session });

    if (!sessionDoc) {
      sessionDoc = new Result({
        learnerId,
        session,
        results: [], // terms go here
      });
    }

    // Ensure results is an array
    if (!Array.isArray(sessionDoc.results)) sessionDoc.results = [];

    // Find (or create) term object inside sessionDoc.results
    let termIndex = sessionDoc.results.findIndex(
      (t) => String(t.term).trim() === String(term).trim()
    );
    if (termIndex === -1) {
      sessionDoc.results.push({
        term,
        subjects: [],
      });
      termIndex = sessionDoc.results.length - 1;
    }

    const termObj = sessionDoc.results[termIndex];

    // Ensure subjects is array
    if (!Array.isArray(termObj.subjects)) termObj.subjects = [];

    // Find subject entry
    let subjIndex = termObj.subjects.findIndex((s) => s.subject === subject);
    if (subjIndex === -1) {
      termObj.subjects.push({
        subject,
        CA1: undefined,
        CA2: undefined,
        HF: undefined,
        Project: undefined,
        Exams: undefined,
        Total: 0,
        Grade: undefined,
        Remark: undefined,
      });
      subjIndex = termObj.subjects.length - 1;
    }

    // Allowed keys that may be sent from client
    const allowed = ["CA1", "CA2", "HF", "Project", "Exams"];

    // Update only provided fields (non-empty). If force === true and value === null => clear.
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key];
        if (v === null && force) {
          termObj.subjects[subjIndex][key] = undefined;
        } else if (v !== undefined && v !== null && String(v).trim() !== "") {
          termObj.subjects[subjIndex][key] = Number(v);
        }
        // else skip - do not override existing value
      }
    }

    // Recompute total and grade for that subject
    const sEntry = termObj.subjects[subjIndex];
    const total =
      Number(sEntry.CA1 || 0) +
      Number(sEntry.CA2 || 0) +
      Number(sEntry.HF || 0) +
      Number(sEntry.Project || 0) +
      Number(sEntry.Exams || 0);

    sEntry.Total = total;
    sEntry.Grade = computeGrade(total);

    // Save the sessionDoc (which contains term array)
    await sessionDoc.save();

    // Prepare response: return the updated sessionDoc and the updated term entry + subject entry
    const updatedSessionDoc = await Result.findById(sessionDoc._id).populate(
      "learnerId",
      "fullName admissionNo classLevel"
    );

    const updatedTerm = updatedSessionDoc.results.find(
      (t) => String(t.term).trim() === String(term).trim()
    );

    const updatedSubject = updatedTerm
      ? updatedTerm.subjects.find((x) => x.subject === subject)
      : null;

    return NextResponse.json({
      success: true,
      message: "Subject scores updated.",
      sessionResult: updatedSessionDoc, // full session doc
      term: updatedTerm || null,
      resultSubject: updatedSubject || null,
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Server error, please try again later.",
    });
  }
}

/**
 * GET: Fetch all session-docs for this learner.
 * Accepts optional query params:
 * - session: "2024/2025"
 * - term: "First Term"
 *
 * Examples:
 * /api/results/:learnerId
 * /api/results/:learnerId?session=2024/2025
 * /api/results/:learnerId?session=2024/2025&term=First%20Term
 */
export async function GET(req, { params }) {
  const { learnerId } = params;
  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session");
  const term = searchParams.get("term");

  try {
    await dbConnect();
    let docs = await Result.find({ learnerId }).populate(
      "learnerId",
      "fullName admissionNo classLevel"
    );

    if (!docs || docs.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    // If session provided, filter to only that session
    if (session) {
      docs = docs.filter((d) => d.session === session);
    }

    // If term provided, reduce each doc to only include that term (if exists)
    if (term) {
      docs = docs.map((d) => {
        const termObj = (d.results || []).find((t) => t.term === term);
        const docObj = d.toObject();
        docObj.results = termObj ? [termObj] : [];
        return docObj;
      });
    } else {
      // convert to plain objects for consistent client shape
      docs = docs.map((d) => d.toObject());
    }

    return NextResponse.json({ success: true, results: docs });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch results.",
    });
  }
}
