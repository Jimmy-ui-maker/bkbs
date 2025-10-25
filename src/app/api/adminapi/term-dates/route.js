import { NextResponse } from "next/server";
import TermDates from "@/models/TermDates";
import dbConnect from "@/lib/db";

export async function GET() {
  await dbConnect();
  const terms = await TermDates.find().sort({ createdAt: -1 });
  return NextResponse.json({ success: true, terms });
}

export async function POST(req) {
  try {
    await dbConnect();
    const { term, session, termOpens, termEnds, nextTermBegins } =
      await req.json();

    const newTerm = await TermDates.create({
      term,
      session,
      termOpens,
      termEnds,
      nextTermBegins,
    });

    return NextResponse.json({
      success: true,
      message: "Term date added successfully",
      term: newTerm,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error adding term" });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { id, termOpens, termEnds, nextTermBegins } = await req.json();

    const updated = await TermDates.findByIdAndUpdate(
      id,
      { termOpens, termEnds, nextTermBegins },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Term date updated successfully",
      term: updated,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Error updating term" });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();
    await TermDates.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Term deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error deleting term" });
  }
}
