const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: String, required: true },
      },
    ],
    timeLimit: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // ❌ Remove explicit createdAt
  },
  { timestamps: true } // ✅ This automatically adds createdAt/updatedAt
);

module.exports = mongoose.model("Quiz", QuizSchema);
