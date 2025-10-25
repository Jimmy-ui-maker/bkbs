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

    // ✅ Save learner’s updated result
    await sessionDoc.save();

    // ✅ Recompute Highest & Lowest for that subject in the same class/session/term
    const allClassResults = await Result.find({ session })
      .populate("learnerId", "classLevel")
      .lean();

    const sameClassResults = allClassResults.filter(
      (r) => r.learnerId?.classLevel === learner.classLevel
    );

    const totals = [];
    for (const r of sameClassResults) {
      const termObj = (r.results || []).find((t) => t.term === term);
      if (!termObj) continue;
      const subjEntry = (termObj.subjects || []).find(
        (s) => s.subject === subject
      );
      if (subjEntry) totals.push(subjEntry.Total || 0);
    }

    const Highest = totals.length ? Math.max(...totals) : total;
    const Lowest = totals.length ? Math.min(...totals) : total;

    // ✅ Get updated session doc for response
    const updatedSessionDoc = await Result.findById(sessionDoc._id)
      .populate("learnerId", "fullName admissionNo classLevel")
      .lean();

    const updatedTerm = updatedSessionDoc.results.find(
      (t) => String(t.term).trim() === String(term).trim()
    );

    const updatedSubject = updatedTerm
      ? updatedTerm.subjects.find((x) => x.subject === subject)
      : null;

    // ✅ Attach computed stats before returning
    if (updatedSubject) {
      updatedSubject.Highest = Highest;
      updatedSubject.Lowest = Lowest;
    }

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


// ✅ In-memory cache to store subject stats temporarily
const subjectStatsCache = new Map();

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

    // --- Fetch all results for this learner ---
    let docs = await Result.find({ learnerId })
      .populate("learnerId", "fullName admissionNo classLevel")
      .lean();

    if (!docs || docs.length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    // --- Filter by session ---
    if (session) {
      docs = docs.filter((d) => d.session === session);
    }

    // --- Filter by term (optional) ---
    if (term) {
      docs = docs.map((d) => {
        const termObj = (d.results || []).find(
          (t) => String(t.term).trim() === String(term).trim()
        );
        return {
          ...d,
          results: termObj ? [termObj] : [],
        };
      });
    }

    // --- Compute subject-wise highest/lowest if session & term are given ---
    if (session && term && docs.length > 0) {
      const learnerClass = docs[0]?.learnerId?.classLevel;
      const cacheKey = `${learnerClass}-${session}-${term}`;

      let subjectHighLow = subjectStatsCache.get(cacheKey);

      if (!subjectHighLow) {
        console.log(`🧠 Computing subject stats for ${cacheKey}`);

        const allClassResults = await Result.find({ session })
          .populate("learnerId", "fullName classLevel")
          .lean();

        const sameClassResults = allClassResults.filter(
          (r) => r.learnerId?.classLevel === learnerClass
        );

        const subjectStats = {};

        for (const r of sameClassResults) {
          const termObj = (r.results || []).find(
            (t) => String(t.term).trim() === String(term).trim()
          );
          if (!termObj) continue;

          for (const subj of termObj.subjects || []) {
            if (!subjectStats[subj.subject]) subjectStats[subj.subject] = [];
            subjectStats[subj.subject].push(Number(subj.Total) || 0);
          }
        }

        subjectHighLow = {};
        for (const [subject, totals] of Object.entries(subjectStats)) {
          subjectHighLow[subject] = {
            highest: Math.max(...totals),
            lowest: Math.min(...totals),
          };
        }

        // Cache for 10 mins
        subjectStatsCache.set(cacheKey, subjectHighLow);
        setTimeout(() => {
          subjectStatsCache.delete(cacheKey);
          console.log(`🧹 Cache cleared for ${cacheKey}`);
        }, 10 * 60 * 1000);
      } else {
        console.log(`⚡ Using cached subject stats for ${cacheKey}`);
      }

      // --- Attach High/Low stats ---
      for (const d of docs) {
        for (const t of d.results || []) {
          for (const s of t.subjects || []) {
            s.Highest = subjectHighLow[s.subject]?.highest ?? "-";
            s.Lowest = subjectHighLow[s.subject]?.lowest ?? "-";
          }
        }
      }
    }

    return NextResponse.json({ success: true, results: docs });
  } catch (error) {
    console.error("❌ Error fetching results:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to fetch results.",
    });
  }
}
