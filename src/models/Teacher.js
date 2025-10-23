import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  guarantorPhone: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  qualification: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  address: { type: String, required: true },
  password: { type: String, required: true },
  classLevel: { type: String, default: "" }, // ✅ Added this
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Teacher ||
  mongoose.model("Teacher", teacherSchema);
