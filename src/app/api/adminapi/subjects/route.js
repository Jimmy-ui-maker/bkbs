import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";

export async function POST(req) {
  try {
    await dbConnect();

    const { classLevel, subjects } = await req.json();
    if (!classLevel || !subjects?.length) {
      return NextResponse.json(
        { success: false, error: "Class level and subjects are required." },
        { status: 400 }
      );
    }

    // ✅ Define class groups
    const classGroups = {
      Reception: ["Reception 1", "Reception 2"],
      Nursery: ["Nursery 1", "Nursery 2"],
      Basic: ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6"],
      JSS: ["JSS 1", "JSS 2", "JSS 3"],
      SSS: ["SSS 1", "SSS 2", "SSS 3"],
    };

    // ✅ Find group for selected class
    let targetGroup = [];
    for (const [group, levels] of Object.entries(classGroups)) {
      if (levels.includes(classLevel)) {
        targetGroup = levels;
        break;
      }
    }

    // ✅ Save/Update subjects for all classes in the group
    for (const level of targetGroup) {
      const existing = await Subject.findOne({ classLevel: level });
      if (existing) {
        existing.subjects = subjects;
        await existing.save();
      } else {
        await Subject.create({ classLevel: level, subjects });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Subjects saved successfully for ${targetGroup.join(", ")}`,
    });
  } catch (err) {
    console.error("❌ Error saving subjects:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const classLevel = searchParams.get("classLevel");

  try {
    await dbConnect();

    let subjects;
    if (classLevel) {
      subjects = await Subject.find({ classLevel });
    } else {
      subjects = await Subject.find();
    }

    // ✅ Always return an array for frontend consistency
    return NextResponse.json({
      success: true,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch subjects.",
    });
  }
}
