import dbConnect from "@/lib/db";
import AssignClass from "@/models/AssignClass";
import Teacher from "@/models/Teacher";
import Learner from "@/models/Learner";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    console.log("🔍 [API] Received teacher email:", email);

    if (!email) {
      return NextResponse.json({
        success: false,
        error: "Teacher email required",
      });
    }

    const teacher = await Teacher.findOne({ email });
    console.log("👩‍🏫 [API] Teacher fetched:", teacher ? teacher._id : "Not found");

    if (!teacher) {
      return NextResponse.json({ success: false, error: "Teacher not found" });
    }

    const assigned = await AssignClass.findOne({ teacherId: teacher._id });
    console.log("📚 [API] Assigned class found:", assigned);

    if (!assigned) {
      console.log("⚠️ [API] No assigned class found for teacher");
      return NextResponse.json({
        success: true,
        learners: [],
        classLevel: null,
      });
    }

    const learners = await Learner.find({
      classLevel: assigned.classLevel,
    }).select("fullName admissionNo classLevel");
    console.log(`🎓 [API] Found ${learners.length} learners in ${assigned.classLevel}`);

    return NextResponse.json({
      success: true,
      classLevel: assigned.classLevel,
      learners,
    });
  } catch (error) {
    console.error("❌ [API] Error fetching learners for teacher:", error);
    return NextResponse.json({
      success: false,
      error: "Server error fetching learners",
    });
  }
}
