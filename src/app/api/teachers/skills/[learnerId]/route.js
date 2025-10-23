// src/app/api/teachers/skills/[id]/route.js
import dbConnect from "@/lib/db";
import Skill from "@/models/Skills"; // <-- make sure your Skill model is imported

// ✅ GET - Fetch skills for a specific learner (and latest term if multiple)
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;

  try {
    const skill = await Skill.findOne({ learnerId: id }).sort({
      updatedAt: -1,
    });
    if (!skill) {
      return new Response(
        JSON.stringify({ success: false, message: "No skill record found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, skill }), {
      status: 200,
    });
  } catch (err) {
    console.error("GET Skill error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}

// ✅ POST - Create or update skills for learner
export async function POST(req, { params }) {
  await dbConnect();
  const { id } = params;
  const { learnerId, psychomotor, affective, term } = await req.json();

  try {
    const updated = await Skill.findOneAndUpdate(
      { learnerId: id, term },
      { psychomotor, affective, learnerId: id, term },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify({ success: true, skill: updated }), {
      status: 200,
    });
  } catch (err) {
    console.error("POST Skill error:", err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500 }
    );
  }
}
