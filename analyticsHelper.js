const Analytics = require('../models/Analytics');

const logActivity = async (userId, fieldsToIncrement) => {
  try {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    await Analytics.incrementForDate(userId, today, fieldsToIncrement);
  } catch (error) {
    console.error('Error logging activity analytics:', error.message);
  }
};

module.exports = { logActivity };
