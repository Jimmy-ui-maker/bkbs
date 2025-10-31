import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TeacherRemark from "@/models/TeacherRemark";

export async function DELETE(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" });

    await TeacherRemark.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete remark error:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
