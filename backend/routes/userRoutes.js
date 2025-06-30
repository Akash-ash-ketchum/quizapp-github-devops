const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (require authentication)
router.get("/:userId/attempts", authMiddleware, userController.getUserProgress);
router.post("/attempts", authMiddleware, userController.addQuizAttempt);
router.post("/record-login", authMiddleware, userController.recordLogin);
router.get("/", (req, res) => {
  res.send("✅ Users route reached");
});

module.exports = router;