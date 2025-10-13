import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    classLevel: {
      type: String,
      required: true,
      enum: [
        "Reception 1",
        "Reception 2",
        "Nursery 1",
        "Nursery 2",
        "Basic 1",
        "Basic 2",
        "Basic 3",
        "Basic 4",
        "Basic 5",
        "Basic 6",
        "JSS 1",
        "JSS 2",
        "JSS 3",
        "SSS 1",
        "SSS 2",
        "SSS 3",
      ],
    },
    subjects: [
      {
        name: { type: String, required: true },
        code: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Subject ||
  mongoose.model("Subject", SubjectSchema);
