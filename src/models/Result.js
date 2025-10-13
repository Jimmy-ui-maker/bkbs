import mongoose from "mongoose";

const SubjectScoreSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  CA1: { type: Number, default: 0 },
  CA2: { type: Number, default: 0 },
  HF: { type: Number, default: 0 },
  Project: { type: Number, default: 0 },
  Exams: { type: Number, default: 0 },
  Total: { type: Number, default: 0 },
  Grade: { type: String },
});

const ResultSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
      default: "First Term",
    },
    session: {
      type: String,
      default: "2025/2026",
    },
    subjects: [SubjectScoreSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
