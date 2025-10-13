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

export async function POST(req, { params }) {
  const { learnerId } = params;
  // Accept partial fields; body may contain only one or some fields
  const body = await req.json();
  const { subject, term = "First Term", session = "2025/2026", force } = body;

  if (!learnerId || !subject) {
    return NextResponse.json({
      success: false,
      error: "Learner ID and subject are required",
    });
  }

  try {
    await dbConnect();

    const learner = await Learner.findById(learnerId);
    if (!learner)
      return NextResponse.json({ success: false, error: "Learner not found" });

    // Find or create a result document for this learner/term/session
    let result = await Result.findOne({ learnerId, term, session });

    if (!result) {
      result = new Result({
        learnerId,
        classLevel: learner.classLevel,
        term,
        session,
        subjects: [],
      });
    }

    // ensure subjects exists
    if (!Array.isArray(result.subjects)) result.subjects = [];

    // find subject entry
    let sub = result.subjects.find((s) => s.subject === subject);

    if (!sub) {
      // create a fresh subject entry with no forced default zeros (use null/undefined)
      sub = {
        subject,
        CA1: undefined,
        CA2: undefined,
        HF: undefined,
        Project: undefined,
        Exams: undefined,
        Total: 0,
        Grade: undefined,
      };
      result.subjects.push(sub);
    }

    // Allowed fields mapping (frontend names -> stored keys)
    const allowedFields = {
      CA1: "CA1",
      CA2: "CA2",
      HF: "HF",
      Project: "Project",
      Exams: "Exams",
    };

    // Update only fields present (and not null/empty string). If force==true we allow overwrite.
    for (const key of Object.keys(allowedFields)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const raw = body[key];
        // accept numeric-like values; skip if explicitly null/undefined/empty string
        if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
          sub[allowedFields[key]] = Number(raw);
        } else if (force && raw === null) {
          // force clearing if caller explicitly sends null and uses force flag
          sub[allowedFields[key]] = undefined;
        }
      }
    }

    // compute total from whatever numeric values are present (treat missing as 0)
    const total =
      Number(sub.CA1 || 0) +
      Number(sub.CA2 || 0) +
      Number(sub.HF || 0) +
      Number(sub.Project || 0) +
      Number(sub.Exams || 0);

    sub.Total = total;
    sub.Grade = computeGrade(total);

    await result.save();

    // Return the updated subject entry so client can update UI easily
    const updatedSubject = result.subjects.find((s) => s.subject === subject);

    return NextResponse.json({
      success: true,
      message: "Subject scores updated.",
      result,
      resultSubject: updatedSubject,
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Server error, please try again later.",
    });
  }
}

export async function GET(req, { params }) {
  const { learnerId } = params;
  try {
    await dbConnect();
    const results = await Result.find({ learnerId }).populate(
      "learnerId",
      "fullName admissionNo classLevel"
    );
    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch results.",
    });
  }
}
