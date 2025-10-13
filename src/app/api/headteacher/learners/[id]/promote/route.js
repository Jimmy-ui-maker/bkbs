import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";

const classes = [
  "Creche",
  "Nursery 1",
  "Nursery 2",
  "Basic 1",
  "Basic 2",
  "Basic 3",
  "Basic 4",
  "Basic 5",
  "Basic 6",
];

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const learner = await Learner.findById(params.id);

    if (!learner) {
      return new Response(JSON.stringify({ error: "Learner not found" }), {
        status: 404,
      });
    }

    const currentIndex = classes.indexOf(learner.classLevel);
    if (currentIndex === -1 || currentIndex === classes.length - 1) {
      return new Response(JSON.stringify({ error: "Cannot promote further" }), {
        status: 400,
      });
    }

    learner.classLevel = classes[currentIndex + 1];
    await learner.save();

    return new Response(JSON.stringify({ success: true, learner }), {
      status: 200,
    });
  } catch (error) {
    console.error("Promote learner error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
