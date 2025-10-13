import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";
import Counter from "@/models/Counter";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const currentYear = new Date().getFullYear(); // e.g. 2025
    const yearShort = String(currentYear).slice(-2); // "25"
    const stateCode = "A"; // Abuja
    const schoolCode = "BKBS";

    // Find or create counter for this year
    let counter = await Counter.findOne({ year: currentYear });
    if (!counter) {
      counter = await Counter.create({ year: currentYear, sequence: 0 });
    }

    // Increment sequence
    counter.sequence += 1;
    await counter.save();

    // Format admission number
    const admissionNo = `${schoolCode}/${stateCode}${yearShort}/${String(
      counter.sequence
    ).padStart(3, "0")}`;

    // Save learner
    const learner = await Learner.create({
      ...body,
      admissionNo,
      year: currentYear,
    });

    return new Response(JSON.stringify({ success: true, learner }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error enrolling learner:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
}


export async function GET() {
  try {
    await dbConnect();

    // Fetch all learners, sorted by newest first
    const learners = await Learner.find().sort({ createdAt: -1 });

    return new Response(JSON.stringify({ success: true, learners }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching learners:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
}