const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User"); // Import User model

const router = express.Router();

// Signup Route
router.post(
  "/signup",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      await registerUser(req, res);  // Await the async function
    } catch (error) {
      return res.status(500).json({ message: "Error during registration" });
    }
  }
);

// Login Route
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      await loginUser(req, res);  // Await the async function
    } catch (error) {
      return res.status(500).json({ message: "Error during login" });
    }
  }
);

// 🆕 User Profile Route (Step 5)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
