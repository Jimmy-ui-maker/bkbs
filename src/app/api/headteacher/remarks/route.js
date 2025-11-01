import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import HeadTeacherRemark from "@/models/HeadTeacherRemark";
import Staff from "@/models/Staff";

export const dynamic = "force-dynamic";

/* ============================
   🟢 CREATE or UPDATE
============================ */
export async function POST(req) {
  try {
    await dbConnect();
    const {
      id, // present only when editing
      learnerId,
      className,
      session,
      term,
      remark,
      headTeacherId,
      headTeacherEmail,
      headTeacherName,
    } = await req.json();

    if (!learnerId || !className || !session || !term)
      return NextResponse.json({
        success: false,
        error: "Missing required fields (learnerId, className, session, term)",
      });

    // ✅ Find Head Teacher by id/email
    let headTeacherDoc = null;
    if (headTeacherId)
      headTeacherDoc = await Staff.findById(headTeacherId).select(
        "name email role"
      );
    else if (headTeacherEmail)
      headTeacherDoc = await Staff.findOne({ email: headTeacherEmail }).select(
        "name email role"
      );

    if (
      !headTeacherDoc ||
      headTeacherDoc.role?.toLowerCase() !== "head teacher"
    )
      return NextResponse.json({
        success: false,
        error: "No logged-in head teacher found or role mismatch",
      });

    const hName = headTeacherName || headTeacherDoc.name;
    const hId = headTeacherDoc._id;

    // ✅ Update if editing
    if (id) {
      const updated = await HeadTeacherRemark.findByIdAndUpdate(
        id,
        { remark },
        { new: true }
      );
      return NextResponse.json({ success: true, remark: updated });
    }

    // ✅ Upsert unique record per learner/class/session/term
    const doc = await HeadTeacherRemark.findOneAndUpdate(
      { learnerId, className, session, term },
      {
        learnerId,
        className,
        session,
        term,
        remark,
        headTeacherId: hId,
        headTeacherName: hName,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, remark: doc });
  } catch (error) {
    console.error("❌ HeadTeacherRemark POST error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

/* ============================
   🟢 GET
============================ */
export async function GET(req) {
  try {
    await dbConnect();

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

    const remarks = await HeadTeacherRemark.find(q)
      .populate("learnerId", "fullName admissionNo")
      .populate("headTeacherId", "name email role");

    return NextResponse.json({ success: true, remarks });
  } catch (err) {
    console.error("❌ HeadTeacherRemark GET error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}

/* ============================
   🟢 DELETE
============================ */
export async function DELETE(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" });

    await HeadTeacherRemark.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ HeadTeacherRemark DELETE error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
