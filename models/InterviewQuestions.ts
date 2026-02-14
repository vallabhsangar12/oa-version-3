import mongoose from "mongoose";

const InterviewQuestionsSchema = new mongoose.Schema({
  sessionId: String,
  questions: [String],
  status: {
    type: String,
    enum: ["pending", "ready"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.InterviewQuestions ||
  mongoose.model("InterviewQuestions", InterviewQuestionsSchema);