const User = require("../models/User");
const Quiz = require("../models/Quiz");

// Updated getDateRange function (preserves old parameters + adds new presets)
const getDateRange = (period) => {
  const now = new Date();
  const utcNow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  // Map new presets to old parameters
  const presetMap = {
    today: 'day',
    yesterday: 'day',
    last7: 'week',
    thisMonth: 'month'
  };

  // Handle both old and new parameters
  switch(period in presetMap ? presetMap[period] : period) {
    case 'day':
      if(period === 'yesterday') {
        const yesterday = new Date(utcNow);
        yesterday.setUTCDate(utcNow.getUTCDate() - 1);
        return {
          start: new Date(yesterday.setUTCHours(0,0,0,0)),
          end: new Date(yesterday.setUTCHours(23,59,59,999))
        };
      }
      return {
        start: new Date(utcNow.setUTCHours(0,0,0,0)),
        end: new Date(utcNow.setUTCHours(23,59,59,999))
      };

    case 'week':
      return {
        start: new Date(utcNow.setUTCDate(utcNow.getUTCDate() - 7)),
        end: new Date(utcNow)
      };

    case 'month':
      return {
        start: new Date(Date.UTC(utcNow.getUTCFullYear(), utcNow.getUTCMonth(), 1)),
        end: new Date(utcNow)
      };

    case 'allTime':
      return {
        start: new Date(0),
        end: new Date(utcNow)
      };

    default:
      if(typeof period === 'object') {
        return {
          start: new Date(period.startDate),
          end: new Date(period.endDate)
        };
      }
      return {
        start: new Date(utcNow.setUTCHours(0,0,0,0)),
        end: new Date(utcNow)
      };
  }
};

exports.getLoginStats = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const rangeParams = period ? { period } : { startDate, endDate };
    const { start, end } = getDateRange(rangeParams);
    
    const logins = await User.aggregate([
      { $unwind: "$loginActivity" },
      { $match: { 
        loginActivity: { 
          $gte: start, 
          $lte: end 
        } 
      }},
      { $count: "count" }
    ]);

    res.json({ logins: logins[0]?.count || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuizStats = async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const rangeParams = period ? { period } : { startDate, endDate };
    const { start, end } = getDateRange(rangeParams);
    
    const attempts = await User.aggregate([
      { $unwind: "$quizAttempts" },
      { $match: { 
        "quizAttempts.date": { 
          $gte: start, 
          $lte: end 
        } 
      }},
      { $count: "count" }
    ]);

    res.json({ quizzes: attempts[0]?.count || 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getLoginTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await User.aggregate([
      { $unwind: "$loginActivity" },
      { $match: { 
        loginActivity: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      }},
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$loginActivity" } },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuizTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await User.aggregate([
      { $unwind: "$quizAttempts" },
      { $match: { 
        "quizAttempts.date": { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      }},
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$quizAttempts.date" } },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    // Total registered users
    const totalUsers = await User.countDocuments();

    // Today's start/end in UTC
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Users registered today
    const dailyRegistrations = await User.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    res.json({ totalUsers, dailyRegistrations });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};