import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  classLevel: { type: String, required: true },
  session: { type: String, required: true },
  term: { type: String, required: true },
  date: { type: Date, required: true },
  records: [
    {
      learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Learner" },
      status: { type: String, enum: ["Present", "Absent"], default: "Absent" },
    },
  ],
});

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", AttendanceSchema);
