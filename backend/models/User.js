const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizAttempts: [
    {
      quizType: { type: String, enum: ["topic", "document"], required: true },
      topic: { type: String }, // Only for topic-based quizzes
      score: { type: Number, required: true },
      totalQuestions: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  loginActivity: [{ type: Date }], // Add this line
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);