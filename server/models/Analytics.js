const { query } = require('../config/db');

const toAnalytics = (row) => row && ({
  _id: String(row.id),
  userId: row.user_id,
  date: row.activity_date,
  studyMinutes: row.study_minutes,
  tasksCompleted: row.tasks_completed,
  pomodorosCompleted: row.pomodoros_completed,
  aiGenerationsCount: row.ai_generations_count,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listRecentByUser = async (userId, limit = 7) => {
  const rows = await query(
    'SELECT * FROM analytics WHERE user_id = ? ORDER BY activity_date ASC LIMIT ?',
    [userId, limit]
  );
  return rows.map(toAnalytics);
};

const incrementForDate = async (userId, activityDate, increments) => {
  await query(
    `INSERT INTO analytics (
      user_id, activity_date, study_minutes, tasks_completed, pomodoros_completed, ai_generations_count
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      study_minutes = study_minutes + VALUES(study_minutes),
      tasks_completed = tasks_completed + VALUES(tasks_completed),
      pomodoros_completed = pomodoros_completed + VALUES(pomodoros_completed),
      ai_generations_count = ai_generations_count + VALUES(ai_generations_count)`,
    [
      userId,
      activityDate,
      increments.studyMinutes || 0,
      increments.tasksCompleted || 0,
      increments.pomodorosCompleted || 0,
      increments.aiGenerationsCount || 0,
    ]
  );
};

module.exports = { incrementForDate, listRecentByUser };
