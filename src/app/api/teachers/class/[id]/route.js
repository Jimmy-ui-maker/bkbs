// 📁 src/app/api/teachers/class/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AssignClass from "@/models/AssignClass";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const record = await AssignClass.findOne({ teacherId: id });
    if (!record)
      return NextResponse.json({
        success: false,
        message: "No class assigned to this teacher",
      });

    return NextResponse.json({
      success: true,
      classLevel: record.classLevel,
    });
  } catch (err) {
    console.error("❌ Error fetching class:", err);
    return NextResponse.json({
      success: false,
      message: err.message,
    });
  }
}
