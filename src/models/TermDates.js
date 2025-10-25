import mongoose from "mongoose";

const TermDatesSchema = new mongoose.Schema(
  {
    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
      required: true,
    },
    session: {
      type: String,
      required: true,
    },
    termOpens: { type: String, required: true },
    termEnds: { type: String, required: true },
    nextTermBegins: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite error during hot reload
export default mongoose.models.TermDates ||
  mongoose.model("TermDates", TermDatesSchema);
