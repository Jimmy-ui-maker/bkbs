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

    const normalizedDate = new Date(new Date(date).toDateString());

    // 🔹 Find or create attendance document for class & session
    let attendanceDoc = await Attendance.findOne({ classLevel, session });

    if (!attendanceDoc) {
      attendanceDoc = new Attendance({
        classLevel,
        session,
        terms: [],
      });
    }

    // 🔹 Find the term inside "terms"
    let termEntry = attendanceDoc.terms.find((t) => t.term === term);

    if (!termEntry) {
      termEntry = { term, attendance: [] };
      attendanceDoc.terms.push(termEntry);
    }

    // 🔹 Check if date already exists inside this term
    const existingDay = termEntry.attendance.find(
      (d) => new Date(d.date).toDateString() === normalizedDate.toDateString()
    );

    if (existingDay) {
      existingDay.records = records;
    } else {
      termEntry.attendance.push({
        date: normalizedDate,
        records,
      });
    }

    // 🔹 Save entire document
    await attendanceDoc.save();

    // Count totals
    const presentCount = records.filter((r) => r.status === "Present").length;
    const absentCount = records.filter((r) => r.status === "Absent").length;

    return NextResponse.json({
      success: true,
      summary: { presentCount, absentCount },
    });
  } catch (error) {
    console.error("❌ Attendance saving failed:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
