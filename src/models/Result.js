import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  subject: String,
  code: String,
  CA1: Number,
  CA2: Number,
  HF: Number,
  Project: Number,
  Exams: Number,
  Total: Number,
  Grade: String,
  Remark: String,
});

const termSchema = new mongoose.Schema({
  term: { type: String, required: true }, // "First Term", "Second Term", "Third Term"
  subjects: [subjectSchema],
});

const resultSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    session: { type: String, default: "2024/2025" },
    results: [termSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Result || mongoose.model("Result", resultSchema);
