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

    const attendance = await Attendance.findOneAndUpdate(
      { classLevel, session, term, date },
      { records },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("❌ Attendance marking failed:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
