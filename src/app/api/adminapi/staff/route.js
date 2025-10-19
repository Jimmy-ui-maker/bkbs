import { NextResponse } from "next/server";
import  dbConnect  from "@/lib/db";
import Staff from "@/models/Staff";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, phone, address, password, confirmPassword, role } =
      body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const roleTaken = await Staff.findOne({ role });
    if (roleTaken) {
      return NextResponse.json(
        { success: false, message: `${role} already exists` },
        { status: 400 }
      );
    }

    const emailExists = await Staff.findOne({ email });
    if (emailExists) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 }
      );
    }

    const newStaff = await Staff.create({
      name,
      email,
      phone,
      address,
      password,
      role,
    });

    return NextResponse.json(
      { success: true, message: "Staff created successfully", staff: newStaff },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Server error while creating staff" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await dbConnect();
    const staffs = await Staff.find();
    return NextResponse.json({ success: true, staff: staffs });
  } catch (error) {
    console.error("GET Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching staff" },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { id, name, email, phone, address, role } = await req.json();

    const updated = await Staff.findByIdAndUpdate(
      id,
      { name, email, phone, address, role },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: "Staff not found" });

    return NextResponse.json({
      success: true,
      message: "Staff updated successfully",
      staff: updated,
    });
  } catch (error) {
    console.error("PUT Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating staff" },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { id, block } = await req.json();

    const updated = await Staff.findByIdAndUpdate(
      id,
      { isBlocked: block },
      { new: true }
    );

    if (!updated)
      return NextResponse.json({ success: false, message: "Staff not found" });

    return NextResponse.json({
      success: true,
      message: block ? "Staff blocked" : "Staff unblocked",
      staff: updated,
    });
  } catch (error) {
    console.error("PATCH Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Error updating status" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json({ success: false, message: "Staff not found" });

    return NextResponse.json({ success: true, message: "Staff deleted" });
  } catch (error) {
    console.error("DELETE Staff error:", error);
    return NextResponse.json(
      { success: false, message: "Error deleting staff" },
      { status: 500 }
    );
  }
}
