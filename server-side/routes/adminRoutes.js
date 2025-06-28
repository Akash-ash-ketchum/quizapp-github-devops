const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.get('/logins', authMiddleware, adminMiddleware, adminController.getLoginStats);
router.get('/quizzes', authMiddleware, adminMiddleware, adminController.getQuizStats);
router.get('/login-trend', authMiddleware, adminMiddleware, adminController.getLoginTrends);
router.get('/quiz-trend', authMiddleware, adminMiddleware, adminController.getQuizTrends);
router.get('/user-stats', authMiddleware, adminMiddleware, adminController.getUserStats);

module.exports = router;