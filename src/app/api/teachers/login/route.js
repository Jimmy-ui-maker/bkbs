import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    // Find teacher by email
    const teacher = await Teacher.findOne({ email });
    if (!teacher) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or password" }),
        { status: 400 }
      );
    }

    // Validate password (plain-text for now; consider bcrypt later)
    if (teacher.password !== password) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email or password" }),
        { status: 400 }
      );
    }

    // Return only necessary teacher info (no classLevel)
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
    console.error("Teacher login error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Server error: " + error.message,
      }),
      { status: 500 }
    );
  }
}
