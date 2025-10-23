import dbConnect from "@/lib/db";
import AssignClass from "@/models/AssignClass";
import Teacher from "@/models/Teacher";
import { NextResponse } from "next/server";

/* ==================== CREATE or UPDATE (POST) ==================== */
export async function POST(req) {
  try {
    await dbConnect();

    const { teacherId, classLevel, assignedBy } = await req.json();

    if (!teacherId || !classLevel || !assignedBy) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ✅ Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: "Teacher not found",
      });
    }

    // ✅ Create or update
    const updated = await AssignClass.findOneAndUpdate(
      { teacherId },
      { classLevel, assignedBy, assignedAt: new Date() },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Class assigned successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error assigning class:", error);
    return NextResponse.json({
      success: false,
      message: "Server error assigning class",
    });
  }
}

/* ==================== FETCH ALL (GET) ==================== */
export async function GET() {
  try {
    await dbConnect();

    const assignments = await AssignClass.find()
      .populate("teacherId", "fullName email phone")
      .sort({ assignedAt: -1 });

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching assigned classes:", error);
    return NextResponse.json({
      success: false,
      message: "Error fetching assigned classes",
    });
  }
}

/* ==================== UPDATE (PUT) ==================== */
export async function PUT(req) {
  try {
    await dbConnect();

    const { id, teacherId, classLevel } = await req.json();

    if (!id || !teacherId || !classLevel) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      });
    }

    const assignment = await AssignClass.findByIdAndUpdate(
      id,
      { teacherId, classLevel, assignedAt: new Date() },
      { new: true }
    );

    if (!assignment) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      data: assignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json({
      success: false,
      message: "Error updating assignment",
    });
  }
}

/* ==================== DELETE ==================== */
export async function DELETE(req) {
  try {
    await dbConnect();

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Missing ID field",
      });
    }

    const deleted = await AssignClass.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: "Assignment not found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json({
      success: false,
      message: "Error deleting assignment",
    });
  }
}
