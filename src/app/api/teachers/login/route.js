import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // 1️⃣ Find teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
      });
    }

    // 2️⃣ Compare password directly here
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 400,
      });
    }

    // 3️⃣ Return success response
    return new Response(
      JSON.stringify({
        success: true,
        teacher: {
          id: teacher._id,
          fullName: teacher.fullName,
          email: teacher.email,
          specialization: teacher.specialization,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Login teacher error:", error);
    return new Response(
      JSON.stringify({ error: "Server error: " + error.message }),
      { status: 500 }
    );
  }
}
