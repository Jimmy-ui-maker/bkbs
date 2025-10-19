import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";

// ✅ GET - Fetch all sessions
export async function GET() {
  try {
    await dbConnect();
    const sessions = await Session.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sessions,
    });
  } catch (error) {
    console.error("GET /sessions error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch sessions",
    });
  }
}

// ✅ POST - Add a new session
export async function POST(req) {
  try {
    await dbConnect();
    const { sessionName } = await req.json();

    if (!sessionName)
      return NextResponse.json({
        success: false,
        message: "Session name required",
      });

    const exists = await Session.findOne({ sessionName });
    if (exists)
      return NextResponse.json({
        success: false,
        message: "Session already exists",
      });

    const newSession = new Session({ sessionName });
    await newSession.save();

    return NextResponse.json({
      success: true,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("POST /sessions error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to create session",
    });
  }
}

// ✅ PUT - Update existing session
export async function PUT(req) {
  try {
    await dbConnect();
    const { id, sessionName } = await req.json();

    if (!id || !sessionName)
      return NextResponse.json({
        success: false,
        message: "Session ID and new name required",
      });

    const exists = await Session.findOne({ sessionName });
    if (exists && exists._id.toString() !== id)
      return NextResponse.json({
        success: false,
        message: "Another session with this name already exists",
      });

    await Session.findByIdAndUpdate(id, { sessionName });

    return NextResponse.json({
      success: true,
      message: "Session updated successfully",
    });
  } catch (error) {
    console.error("PUT /sessions error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update session",
    });
  }
}

// ✅ DELETE - Delete a session
export async function DELETE(req) {
  try {
    await dbConnect();
    const { id } = await req.json();

    if (!id)
      return NextResponse.json({
        success: false,
        message: "Session ID required",
      });

    await Session.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /sessions error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete session",
    });
  }
}
