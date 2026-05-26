const Analytics = require('../models/Analytics');
const { logActivity } = require('../utils/analyticsHelper');

// @desc    Log a completed study session / Pomodoro session
// @route   POST /api/analytics/log
// @access  Private
exports.logStudySession = async (req, res, next) => {
  const { minutes, isPomodoro } = req.body;

  try {
    const increments = {
      studyMinutes: Number(minutes) || 0
    };

    if (isPomodoro) {
      increments.pomodorosCompleted = 1;
    }

    await logActivity(req.user.id, increments);

    res.json({ success: true, message: 'Study session logged successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user study analytics for charts
// @route   GET /api/analytics/stats
// @access  Private
exports.getAnalytics = async (req, res, next) => {
  try {
    // Fetch last 7 days of logs
    const stats = await Analytics.listRecentByUser(req.user.id, 7);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
