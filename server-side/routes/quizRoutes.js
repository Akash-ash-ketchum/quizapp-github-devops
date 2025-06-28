const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  generateQuiz,
  generateQuizFromDocument,
} = require("../controllers/quizController");

// ✅ Fixed Multer Storage: Preserve File Extensions
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext); // Preserve extension
  },
});

const upload = multer({ storage: storage });

// ✅ Generate quiz from topic (Protected Route)
router.post("/generate", authMiddleware, generateQuiz);

// ✅ Generate quiz from document (Protected Route with Multer)
router.post("/generate-document", authMiddleware, upload.single("file"), generateQuizFromDocument);

// ✅ Create a quiz manually (Protected)
router.post("/create", authMiddleware, createQuiz);

// ✅ Get all quizzes (Public)
router.get("/all", getAllQuizzes);

// ✅ Get a single quiz by ID (Public)
router.get("/:id", getQuizById);

// ✅ Submit a quiz (Protected)
router.post("/submit", authMiddleware, submitQuiz);

module.exports = router;
