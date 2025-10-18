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
    if (!learner) {
      return NextResponse.json({ success: false, error: "Learner not found" });
    }

    // find or create result doc
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

    if (!Array.isArray(result.subjects)) result.subjects = [];

    // find subject entry
    let subIndex = result.subjects.findIndex((s) => s.subject === subject);
    let sub;
    if (subIndex === -1) {
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
      subIndex = result.subjects.length - 1;
    } else {
      sub = result.subjects[subIndex];
    }

    // allowed keys we accept from client
    const allowed = ["CA1", "CA2", "HF", "Project", "Exams"];

    // update only fields present in body (non-empty). If force===true and value===null => clear.
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const v = body[key];
        if (v === null && force) {
          // explicit clear requested
          result.subjects[subIndex][key] = undefined;
        } else if (v !== undefined && v !== null && String(v).trim() !== "") {
          result.subjects[subIndex][key] = Number(v);
        }
        // else: skip (do not override existing value)
      }
    }

    // compute total treating undefined as 0
    const s = result.subjects[subIndex];
    const total =
      Number(s.CA1 || 0) +
      Number(s.CA2 || 0) +
      Number(s.HF || 0) +
      Number(s.Project || 0) +
      Number(s.Exams || 0);

    result.subjects[subIndex].Total = total;
    result.subjects[subIndex].Grade = computeGrade(total);

    await result.save();

    const resultSubject = result.subjects.find((x) => x.subject === subject);

    return NextResponse.json({
      success: true,
      message: "Subject scores updated.",
      result,
      resultSubject,
    });
  } catch (error) {
    console.error("Error saving result:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Server error, please try again later.",
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
