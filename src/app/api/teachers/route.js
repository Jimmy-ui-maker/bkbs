import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const existing = await Teacher.findOne({ email: body.email });
    if (existing) {
      return new Response(JSON.stringify({ error: "Email already exists" }), {
        status: 400,
      });
    }

    const teacher = await Teacher.create(body);

    return new Response(JSON.stringify({ success: true, teacher }), {
      status: 201,
    });
  } catch (error) {
    console.error("Register teacher error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}


export async function GET() {
  try {
    await dbConnect();

    // Fetch all learners, sorted by newest first
    const teachers = await Teacher.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, teachers }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
}