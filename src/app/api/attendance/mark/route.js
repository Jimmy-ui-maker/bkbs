import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();
    const { classLevel, session, term, date, records } = await req.json();

    if (!classLevel || !session || !term || !records?.length) {
      return NextResponse.json({ success: false, error: "Missing fields." });
    }

    // Ensure date object is normalized (so upsert works correctly)
    const normalizedDate = new Date(new Date(date).toDateString());

    const attendance = await Attendance.findOneAndUpdate(
      { classLevel, session, term, date: normalizedDate },
      { records },
      { upsert: true, new: true }
    );

    // Count totals
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;

    return NextResponse.json({
      success: true,
      attendance,
      summary: { presentCount, absentCount },
    });
  } catch (error) {
    console.error("❌ Attendance marking failed:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
