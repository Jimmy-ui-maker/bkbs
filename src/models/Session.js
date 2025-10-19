import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    sessionName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);
