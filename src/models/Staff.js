import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, unique: true },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Ensure model reuse (avoids OverwriteModelError)
export default mongoose.models.Staff || mongoose.model("Staff", StaffSchema);
