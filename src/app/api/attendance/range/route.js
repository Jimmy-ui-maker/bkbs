import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

/**
 * ✅ GET /api/attendance/range?classLevel=...&session=...&term=...&start=ISO&end=ISO
 *
 * Returns:
 * {
 *   success: true,
 *   records: {
 *     "<ISO Date>": [ { learnerId, status }, ... ],
 *     ...
 *   }
 * }
 */
export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("classLevel");
    const session = searchParams.get("session");
    const term = searchParams.get("term");
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!classLevel || !session || !term || !start || !end) {
      return NextResponse.json({
        success: false,
        error: "Missing query parameters.",
      });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // 🔹 Find the attendance document for the given class & session
    const attendanceDoc = await Attendance.findOne({
      classLevel,
      session,
      "terms.term": term,
    }).lean();

    if (!attendanceDoc) {
      return NextResponse.json({ success: true, records: {} });
    }

    // 🔹 Find the specific term
    const termEntry = attendanceDoc.terms.find((t) => t.term === term);
    if (!termEntry) {
      return NextResponse.json({ success: true, records: {} });
    }

    const records = {};

    // 🔹 Loop through each day's attendance within the term
    for (const day of termEntry.attendance) {
      const dateObj = new Date(day.date);
      if (dateObj >= startDate && dateObj <= endDate) {
        records[dateObj.toISOString()] = (day.records || []).map((r) => ({
          learnerId: String(r.learnerId),
          status: r.status,
        }));
      }
    }

    return NextResponse.json({ success: true, records });
  } catch (err) {
    console.error("❌ attendance/range error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Server error",
    });
  }
}
