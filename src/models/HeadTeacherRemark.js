import mongoose from "mongoose";

const HeadTeacherRemarkSchema = new mongoose.Schema(
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
    remark: { type: String, default: "" },
    headTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff", // ✅ fixed: now matches Staff collection
      required: true,
    },
    headTeacherName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.HeadTeacherRemark ||
  mongoose.model("HeadTeacherRemark", HeadTeacherRemarkSchema);
