import mongoose from "mongoose";

const assignClassSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  classLevel: {
    type: String,
    required: true,
  },
  subjects: {
    type: [String], // e.g. ["Mathematics", "English", "Science"]
    default: [],
  },
  assignedBy: {
    type: String, // admin email or name
    required: true,
  },
  assignedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AssignClass ||
  mongoose.model("AssignClass", assignClassSchema);
