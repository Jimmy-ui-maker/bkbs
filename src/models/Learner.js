import mongoose from "mongoose";

const learnerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  admissionNo: { type: String, unique: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  classLevel: { type: String, required: true },
  address: { type: String, required: true },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  parentEmail: { type: String },
  parentOccupation: { type: String },
  password: { type: String, required: true },
  imgUrl: { type: String },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Learner ||
  mongoose.model("Learner", learnerSchema);
