const crypto = require('crypto');
const { query } = require('../config/db');

const parseJson = (value, fallback) => {
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const toQuiz = (row) => row && ({
  _id: row.id,
  userId: row.user_id,
  title: row.title,
  difficulty: row.difficulty,
  questions: parseJson(row.questions, []),
  score: row.score,
  maxScore: row.max_score,
  taken: Boolean(row.taken),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listByUser = async (userId) => {
  const rows = await query('SELECT * FROM quizzes WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(toQuiz);
};

const create = async ({ userId, title, difficulty = 'medium', questions = [], maxScore = 0, score = 0, taken = false }) => {
  const id = crypto.randomUUID();
  await query(
    `INSERT INTO quizzes (id, user_id, title, difficulty, questions, max_score, score, taken)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, title, difficulty, JSON.stringify(questions), maxScore, score, taken]
  );
  return findByIdForUser(id, userId);
};

const findByIdForUser = async (id, userId) => {
  const rows = await query('SELECT * FROM quizzes WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return toQuiz(rows[0]);
};

const updateScore = async (id, userId, score) => {
  await query('UPDATE quizzes SET score = ?, taken = 1 WHERE id = ? AND user_id = ?', [score, id, userId]);
  return findByIdForUser(id, userId);
};

const remove = async (id, userId) => {
  const rows = await query('DELETE FROM quizzes WHERE id = ? AND user_id = ?', [id, userId]);
  return rows.affectedRows > 0;
};

module.exports = { create, findByIdForUser, listByUser, remove, updateScore };
