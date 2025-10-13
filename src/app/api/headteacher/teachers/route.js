import dbConnect from "@/lib/db";
import Teacher from "@/models/Teacher";


export async function GET() {
  try {
    await dbConnect();
    const teachers = await Teacher.find().select("-password"); // hide password
    return new Response(JSON.stringify({ success: true, teachers }), {
      status: 200,
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
