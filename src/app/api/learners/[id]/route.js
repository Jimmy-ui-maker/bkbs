import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";

// ===== UPDATE LEARNER PROFILE =====
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const body = await req.json();

    // Find existing learner
    const learner = await Learner.findById(id);
    if (!learner) {
      return new Response(
        JSON.stringify({ success: false, error: "Learner not found" }),
        { status: 404 }
      );
    }

    // Prevent protected fields from being changed
    const protectedFields = [
      "admissionNo",
      "classLevel",
      "_id",
      "year",
      "createdAt",
    ];
    protectedFields.forEach((field) => delete body[field]);



    // Update learner record
    const updatedLearner = await Learner.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );

    return new Response(
      JSON.stringify({ success: true, learner: updatedLearner }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating learner:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

// ===== GET SINGLE LEARNER (OPTIONAL) =====
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    const learner = await Learner.findById(id);
    if (!learner) {
      return new Response(
        JSON.stringify({ success: false, error: "Learner not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, learner }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching learner:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
