// models/TeacherRemark.js
import mongoose from "mongoose";

const TeacherRemarkSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    session: { type: String, required: true },
    term: { type: String, required: true },
    conduct: { type: String, default: "" },
    remark: { type: String, default: "" },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    teacherName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.TeacherRemark ||
  mongoose.model("TeacherRemark", TeacherRemarkSchema);
