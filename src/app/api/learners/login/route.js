import dbConnect from "@/lib/db";
import Learner from "@/models/Learner";

export async function POST(req) {
  try {
    await dbConnect();
    const { admissionNo, password } = await req.json();

    if (!admissionNo || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Admission No and Password are required.",
        }),
        { status: 400 }
      );
    }

    // Find learner by admission number
    const learner = await Learner.findOne({ admissionNo });

    if (!learner) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid admission number.",
        }),
        { status: 401 }
      );
    }

    // Compare passwords (plain for now)
    if (learner.password !== password) {
      return new Response(
        JSON.stringify({ success: false, message: "Incorrect password." }),
        { status: 401 }
      );
    }

    // Prepare learner data (hide password)
    const learnerData = {
      id: learner._id,
      fullName: learner.fullName,
      admissionNo: learner.admissionNo,
      gender: learner.gender,
      classLevel: learner.classLevel,
      address: learner.address,
      dob: learner.dob,
      parentName: learner.parentName,
      parentPhone: learner.parentPhone,
      parentEmail: learner.parentEmail,
      parentOccupation: learner.parentOccupation,
      imgUrl: learner.imgUrl,
      year: learner.year,
      createdAt: learner.createdAt,
    };

    return new Response(
      JSON.stringify({ success: true, learner: learnerData }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging in learner:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
