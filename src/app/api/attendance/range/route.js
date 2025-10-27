import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Attendance from "@/models/Attendance";

/**
 * GET /api/attendance/range?classLevel=...&session=...&term=...&start=ISO&end=ISO
 *
 * Returns:
 * { success: true, records: { "<ISO Date>": [ { learnerId, status }, ... ], ... } }
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
      return NextResponse.json({ success: false, error: "Missing query parameters" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // find attendance documents for this class/session/term and date range
    const docs = await Attendance.find({
      classLevel,
      session,
      term,
      date: { $gte: startDate, $lte: endDate },
    }).lean();

    // build mapping by date (ISO date string)
    const records = {};
    docs.forEach((d) => {
      const dateKey = new Date(d.date).toISOString();
      records[dateKey] = (d.records || []).map((r) => ({
        learnerId: r.learnerId ? String(r.learnerId) : String(r.learnerId),
        status: r.status,
      }));
    });

    return NextResponse.json({ success: true, records });
  } catch (err) {
    console.error("❌ attendance/range error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" });
  }
}
