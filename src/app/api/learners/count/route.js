import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("class");

    if (!classLevel) {
      return NextResponse.json({ success: false, error: "Class is required." });
    }

    const count = await Learner.countDocuments({ classLevel });
    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("❌ Error counting learners:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to count learners.",
    });
  }
}
