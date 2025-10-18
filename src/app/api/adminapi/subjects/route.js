import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Subject from "@/models/Subject";

const classGroups = {
  Reception: ["Reception 1", "Reception 2"],
  Nursery: ["Nursery 1", "Nursery 2"],
  Basic: ["Basic 1", "Basic 2", "Basic 3", "Basic 4", "Basic 5", "Basic 6"],
  JSS: ["JSS 1", "JSS 2", "JSS 3"],
  SSS: ["SSS 1", "SSS 2", "SSS 3"],
};

// ✅ POST → Add subjects
export async function POST(req) {
  try {
    await dbConnect();
    const { classLevel, subjects } = await req.json();

    if (!classLevel || !subjects?.length)
      return NextResponse.json(
        { success: false, error: "Class level and subjects are required." },
        { status: 400 }
      );

    // Find which group this class belongs to
    let targetGroup = [];
    for (const [_, levels] of Object.entries(classGroups)) {
      if (levels.includes(classLevel)) {
        targetGroup = levels;
        break;
      }
    }

    for (const level of targetGroup) {
      const existing = await Subject.findOne({ classLevel: level });

      if (existing) {
        const existingNames = existing.subjects.map((s) =>
          s.name.toLowerCase().trim()
        );
        const newOnes = subjects.filter(
          (s) => !existingNames.includes(s.name.toLowerCase().trim())
        );
        if (newOnes.length > 0) {
          existing.subjects.push(...newOnes);
          await existing.save();
        }
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
    return NextResponse.json({ success: false, error: err.message });
  }
}

// ✅ GET → Fetch subjects
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const classLevel = searchParams.get("classLevel");

    const subjects = classLevel
      ? await Subject.find({ classLevel })
      : await Subject.find();

    return NextResponse.json({ success: true, subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch subjects.",
    });
  }
}

// ✅ DELETE → Delete subject
export async function DELETE(req) {
  try {
    await dbConnect();
    const { classLevel, subjectName } = await req.json();

    if (!classLevel || !subjectName)
      return NextResponse.json({ success: false, error: "Missing data." });

    const doc = await Subject.findOne({ classLevel });
    if (!doc)
      return NextResponse.json({ success: false, error: "Class not found." });

    doc.subjects = doc.subjects.filter(
      (s) => s.name.toLowerCase() !== subjectName.toLowerCase()
    );
    await doc.save();

    return NextResponse.json({ success: true, message: "Subject deleted." });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ success: false, error: "Delete failed." });
  }
}

// ✅ PUT → Edit subject name/code
export async function PUT(req) {
  try {
    await dbConnect();
    const { classLevel, oldName, newName, newCode } = await req.json();

    if (!classLevel || !oldName || !newName)
      return NextResponse.json({
        success: false,
        error: "Missing required fields.",
      });

    // Find which group this class belongs to
    let targetGroup = [];
    for (const [_, levels] of Object.entries(classGroups)) {
      if (levels.includes(classLevel)) {
        targetGroup = levels;
        break;
      }
    }

    for (const level of targetGroup) {
      const doc = await Subject.findOne({ classLevel: level });
      if (!doc) continue;

      const subject = doc.subjects.find(
        (s) => s.name.toLowerCase() === oldName.toLowerCase()
      );
      if (subject) {
        // Prevent duplicates after rename
        const exists = doc.subjects.some(
          (s) =>
            s.name.toLowerCase() === newName.toLowerCase() &&
            s.name.toLowerCase() !== oldName.toLowerCase()
        );
        if (exists) continue;

        subject.name = newName.trim();
        subject.code = newCode?.trim() || "";
        await doc.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subject updated successfully.",
    });
  } catch (err) {
    console.error("❌ Edit error:", err);
    return NextResponse.json({ success: false, error: "Update failed." });
  }
}
