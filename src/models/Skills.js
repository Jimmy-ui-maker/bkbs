// src/models/Skills.js
import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    learnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learner",
      required: true,
    },
    session: {
      type: String,
      required: true, // 🆕 Add this to uniquely track session
    },
    term: {
      type: String,
      enum: ["First Term", "Second Term", "Third Term"],
      required: true,
    },
    psychomotor: {
      Writing: String,
      Reading: String,
      Fluency: String,
      Sports: String,
      LanguageSkill: String,
    },
    affective: {
      Punctuality: String,
      Neatness: String,
      Politeness: String,
      Cooperation: String,
      SelfControl: String,
      Attentiveness: String,
    },
  },
  { timestamps: true }
);

// 🧠 Prevent duplicate entries per learner, term, and session
SkillSchema.index({ learnerId: 1, term: 1, session: 1 }, { unique: true });

export default mongoose.models.Skill || mongoose.model("Skill", SkillSchema);
