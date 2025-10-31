import mongoose from "mongoose";

const dailyRecordSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  records: [
    {
      learnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Learner" },
      status: { type: String, enum: ["Present", "Absent"], default: "Absent" },
    },
  ],
});

const termAttendanceSchema = new mongoose.Schema({
  term: { type: String, required: true }, // "First Term", "Second Term", etc.
  attendance: [dailyRecordSchema],
});

const attendanceSchema = new mongoose.Schema(
  {
    classLevel: { type: String, required: true },
    session: { type: String, required: true }, // e.g. "2024/2025"
    terms: [termAttendanceSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
