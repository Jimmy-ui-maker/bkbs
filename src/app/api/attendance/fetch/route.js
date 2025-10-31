import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const { classLevel, session, term } = await req.json();

    const attendance = await Attendance.find({ classLevel, session, term });

    return NextResponse.json({
      success: true,
      attendance,
    });
  } catch (error) {
    console.error("❌ Attendance fetch failed:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
