// src/app/api/results/[learnerId]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Result from "@/models/Result";
import Learner from "@/models/Learner";

function computeGrade(total) {
  if (total >= 90) return "A";
  if (total >= 70) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  if (total >= 35) return "E";
  return "F";
}

function computeRemark(grade) {
  switch (grade) {
    case "A":
      return "Excellent";
    case "B":
      return "Very Good";
    case "C":
      return "Credit";
    case "D":
      return "Pass";
    case "E":
      return "Fair";
    case "F":
      return "Intervention";
    default:
      return "";
  }
}

export const dynamic = "force-dynamic";

/**
 * POST: Add or update subject scores for a learner
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

    // Find or create result document for this session
    let sessionDoc = await Result.findOne({ learnerId, session });
    if (!sessionDoc) {
      sessionDoc = new Result({ learnerId, session, results: [] });
    }

    // Ensure term object exists
    let termIndex = sessionDoc.results.findIndex(
      (t) => String(t.term).trim() === String(term).trim()
    );
    if (termIndex === -1) {
      sessionDoc.results.push({ term, subjects: [] });
      termIndex = sessionDoc.results.length - 1;
    }

    const termObj = sessionDoc.results[termIndex];
    if (!Array.isArray(termObj.subjects)) termObj.subjects = [];

    // Find or create subject
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

    // Allowed keys
    const allowed = ["CA1", "CA2", "HF", "Project", "Exams"];

    // Update provided scores
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key];
        if (v === null && force) {
          termObj.subjects[subjIndex][key] = undefined;
        } else if (v !== undefined && v !== null && String(v).trim() !== "") {
          termObj.subjects[subjIndex][key] = Number(v);
        }
      }
    }

    // Compute total, grade, and remark
    const sEntry = termObj.subjects[subjIndex];
    const total =
      Number(sEntry.CA1 || 0) +
      Number(sEntry.CA2 || 0) +
      Number(sEntry.HF || 0) +
      Number(sEntry.Project || 0) +
      Number(sEntry.Exams || 0);

    sEntry.Total = total;
    sEntry.Grade = computeGrade(total);
    sEntry.Remark = computeRemark(sEntry.Grade);

    // Save and return updated doc
    await sessionDoc.save();

    const updatedSessionDoc = await Result.findById(sessionDoc._id)
      .populate("learnerId", "fullName admissionNo classLevel")
      .lean();

    const updatedTerm = updatedSessionDoc.results.find(
      (t) => String(t.term).trim() === String(term).trim()
    );

    const updatedSubject = updatedTerm
      ? updatedTerm.subjects.find((x) => x.subject === subject)
      : null;

    return NextResponse.json({
      success: true,
      message: "Subject scores updated.",
      sessionResult: updatedSessionDoc,
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
 * GET: Fetch all results for a learner (with optional filters)
 */
export async function GET(req, { params }) {
  const { learnerId } = params;
  const { searchParams } = new URL(req.url);
  const session = searchParams.get("session");
  const term = searchParams.get("term");

  try {
    await dbConnect();

    let docs = await Result.find({ learnerId })
      .populate("learnerId", "fullName admissionNo classLevel")
      .lean(); // return plain objects (safe for JSON)

    if (!docs || docs.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Filter by session if provided
    if (session) {
      docs = docs.filter((d) => d.session === session);
    }

    // Filter by term if provided
    if (term) {
      docs = docs.map((d) => {
        const termObj = (d.results || []).find((t) => t.term === term);
        return {
          ...d,
          results: termObj ? [termObj] : [],
        };
      });
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
