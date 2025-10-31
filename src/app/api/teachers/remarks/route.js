import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TeacherRemark from "@/models/TeacherRemark";
import Teacher from "@/models/Teacher"; // <-- to auto-fetch teacher name

export const dynamic = "force-dynamic";

await dbConnect();

/* ===========================
   📌 CREATE / UPDATE (UPSERT)
=========================== */
export async function POST(req) {
  try {
    const {
      learnerId,
      className,
      session,
      term,
      conduct = "",
      remark = "",
      teacherId,
      teacherName, // optional from frontend
    } = await req.json();

    // 🔹 Check minimum required fields
    if (!learnerId || !className || !session || !term || !teacherId) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields (learnerId, className, session, term, teacherId)",
      });
    }

    // 🔹 Auto-fetch teacher name if not provided
    let tName = teacherName;
    if (!tName) {
      const teacherDoc = await Teacher.findById(teacherId).select("fullName name");
      if (teacherDoc) {
        tName = teacherDoc.fullName || teacherDoc.name || "Unknown Teacher";
      } else {
        tName = "Unknown Teacher";
      }
    }

    // 🔹 Upsert (create if not exist, otherwise update)
    const doc = await TeacherRemark.findOneAndUpdate(
      { learnerId, session, term },
      {
        learnerId,
        className,
        session,
        term,
        conduct,
        remark,
        teacherId,
        teacherName: tName,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, remark: doc });
  } catch (error) {
    console.error("❌ TeacherRemark POST error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

/* ===========================
   📌 GET (Fetch remarks)
=========================== */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const learnerId = searchParams.get("learnerId");
    const className = searchParams.get("class");
    const session = searchParams.get("session");
    const term = searchParams.get("term");

    const q = {};
    if (learnerId) q.learnerId = learnerId;
    if (className) q.className = className;
    if (session) q.session = session;
    if (term) q.term = term;

    const remarks = await TeacherRemark.find(q)
      .populate("learnerId", "fullName admissionNo")
      .populate("teacherId", "fullName name"); // also return teacher info

    return NextResponse.json({ success: true, remarks });
  } catch (err) {
    console.error("❌ TeacherRemark GET error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

/* ===========================
   📌 DELETE (Remove remark)
=========================== */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" });

    await TeacherRemark.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ TeacherRemark DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
