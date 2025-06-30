const User = require("../models/User");

exports.getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId || req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const quizAttempts = user.quizAttempts.map(attempt => ({
      quizType: attempt.quizType || 'topic',
      topic: attempt.topic || 'General',
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      date: attempt.date,
      ...(attempt.quizId && { quizId: attempt.quizId })
    }));

    res.status(200).json({ 
      quizAttempts: quizAttempts.sort((a, b) => new Date(b.date) - new Date(a.date)),
      loginActivity: user.loginActivity 
        ? user.loginActivity
            .slice(-5)
            .map(date => date.toISOString())
        : []
    });

  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addQuizAttempt = async (req, res) => {
  try {
    const { quizType, topic, score, totalQuestions, quizId } = req.body;
    const userId = req.user.userId;

    const newAttempt = {
      quizType,
      topic,
      score,
      totalQuestions,
      ...(quizId && { quizId }),
      date: new Date(),
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { quizAttempts: newAttempt } },
      { new: true }
    );

    res.status(201).json(updatedUser.quizAttempts);
  } catch (error) {
    console.error("Error saving quiz attempt:", error);
    res.status(500).json({ message: "Failed to save quiz attempt" });
  }
};

exports.recordLogin = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { loginActivity: req.body.loginTime } }
    );
    res.status(200).send();
  } catch (error) {
    console.error("Error recording login:", error);
    res.status(500).json({ message: "Failed to record login" });
  }
};