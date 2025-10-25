import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Result from "@/models/Result";
import Learner from "@/models/Learner";

export const dynamic = "force-dynamic";

/**
 * GET: Compute Highest and Lowest in a class for a specific session and term
 * Example: /api/results/class-summary?class=JSS1&session=2024/2025&term=First%20Term
 */
export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class");
    const session = searchParams.get("session");
    const term = searchParams.get("term");

    if (!classLevel || !session || !term) {
      return NextResponse.json({
        success: false,
        error: "class, session, and term are required query parameters.",
      });
    }

    // Get all learners in that class
    const learners = await Learner.find({ classLevel }).lean();

    if (!learners || learners.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No learners found for this class.",
      });
    }

    // Get all their results for that session
    const learnerIds = learners.map((l) => l._id);
    const results = await Result.find({
      learnerId: { $in: learnerIds },
      session,
    })
      .populate("learnerId", "fullName admissionNo classLevel")
      .lean();

    if (!results || results.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No results found for this session.",
      });
    }

    const summary = [];

    for (const res of results) {
      const termObj = res.results.find(
        (t) => String(t.term).trim() === String(term).trim()
      );
      if (termObj && Array.isArray(termObj.subjects)) {
        const totalScore = termObj.subjects.reduce(
          (a, b) => a + (b.Total || 0),
          0
        );
        summary.push({
          name: res.learnerId.fullName,
          total: totalScore,
        });
      }
    }

    if (summary.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No valid term data found.",
      });
    }

    // Find highest and lowest
    const sorted = summary.sort((a, b) => b.total - a.total);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    return NextResponse.json({
      success: true,
      highest,
      lowest,
      classLevel,
      session,
      term,
    });
  } catch (error) {
    console.error("❌ Error computing class summary:", error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Failed to compute summary.",
    });
  }
}
