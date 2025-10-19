import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Staff from "@/models/Staff";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email & password required" },
        { status: 400 }
      );
    }

    const staff = await Staff.findOne({ email });
    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Simple password check (plain text for now)
    if (staff.password !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Create a dummy token for now (replace with JWT later)
    const token = `${staff._id}-${Date.now()}`;

    return NextResponse.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: staff._id.toString(),
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
