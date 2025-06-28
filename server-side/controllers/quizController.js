const Quiz = require("../models/Quiz");
const User = require("../models/User");
const extractText = require("../utils/extractText");
const gemini = require("../utils/gemini");
const fs = require("fs");

const SECONDS_PER_QUESTION = 30; // ⏳ Adjust if needed

// ✅ Generate Quiz using Gemini AI (Topic-Based)
exports.generateQuiz = async (req, res) => {
  try {
    const { topic, numQuestions } = req.body;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const questionCount = Math.min(numQuestions || 5, 20);
    const totalTime = questionCount * SECONDS_PER_QUESTION;

    // ✅ Fetch quiz questions from Gemini AI (Topic-Based)
    const quizData = await gemini.generateQuizQuestions(topic, questionCount, "topic");
    if (!quizData.questions.length) {
      return res.status(500).json({ message: "Failed to generate quiz" });
    }

    // ✅ Save quiz to database
    const newQuiz = new Quiz({
      title: quizData.title || `${topic} Quiz`,
      questions: quizData.questions,
      timeLimit: totalTime,
      createdBy: req.user.userId,
    });

    await newQuiz.save();
    res.status(201).json({ message: "Quiz generated successfully!", quiz: newQuiz });

  } catch (error) {
    console.error("❌ Error generating quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Generate Quiz from Uploaded Document (Document-Based)
exports.generateQuizFromDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { numQuestions } = req.body;
    const questionCount = Math.min(numQuestions || 5, 20);
    const totalTime = questionCount * SECONDS_PER_QUESTION;
    const filePath = req.file.path;

    // ✅ Extract text from document
    const extractedText = await extractText(filePath);
    if (!extractedText || extractedText.trim().length < 20) {
      return res.status(400).json({ message: "Extracted text is too short. Please upload a different document." });
    }

    console.log("📄 Extracted Text from Document:\n", extractedText.slice(0, 500));

    // ✅ Fetch quiz questions from Gemini AI (Document-Based)
    const quizData = await gemini.generateQuizQuestions(extractedText, questionCount, "document");
    if (!quizData.questions.length) {
      return res.status(500).json({ message: "Failed to generate quiz from document" });
    }

    // ✅ Save quiz to database
    const newQuiz = new Quiz({
      title: quizData.title || "Document-Based Quiz",
      questions: quizData.questions,
      timeLimit: totalTime,
      createdBy: req.user.userId,
    });

    await newQuiz.save();
    fs.unlinkSync(filePath); // ✅ Delete file after processing

    res.status(201).json({ message: "Quiz generated successfully!", quiz: newQuiz });

  } catch (error) {
    console.error("❌ Error generating quiz from document:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create a new quiz (Manual Entry)
exports.createQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "Title and questions are required" });
    }

    const totalTime = questions.length * SECONDS_PER_QUESTION;

    const newQuiz = new Quiz({
      title,
      questions,
      timeLimit: totalTime,
      createdBy: req.user.userId,
    });

    await newQuiz.save();
    res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });

  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get a single quiz by ID (now includes time limit)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    res.status(200).json(quiz);
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Submit a quiz (Saves User Progress)
// In submitQuiz, make scoring match frontend logic:
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body; // answers now contains {question, selectedAnswer, correctAnswer}
    const userId = req.user.userId;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Match frontend scoring logic:
    const score = answers.reduce((count, answer) => {
      return count + (answer.selectedAnswer === answer.correctAnswer ? 1 : 0);
    }, 0);

    // Save to both places (keeping your existing structure)
    const user = await User.findById(userId);
    if (user) {
      user.quizHistory.push({
        quizId,
        title: quiz.title,
        score, // Now matches frontend
        totalQuestions: quiz.questions.length,
        date: new Date(),
      });
      await user.save();
    }

    res.status(200).json({
      message: "Quiz submitted!",
      score, // Return the synchronized score
      total: quiz.questions.length,
    });
  } catch (error) {
    console.error("❌ Error submitting quiz:", error);
    res.status(500).json({ message: "Server error" });
  }
};