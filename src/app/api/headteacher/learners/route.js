import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";

export async function GET() {
  try {
    await dbConnect();
    const learners = await Learner.find();
    return new Response(JSON.stringify({ success: true, learners }), {
      status: 200,
    });
  } catch (error) {
    console.error("Get learners error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
