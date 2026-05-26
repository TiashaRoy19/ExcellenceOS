const crypto = require('crypto');
const { query } = require('../config/db');

const toTask = (row) => row && ({
  _id: row.id,
  userId: row.user_id,
  title: row.title,
  priority: row.priority,
  category: row.category,
  deadline: row.deadline,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listByUser = async (userId) => {
  const rows = await query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(toTask);
};

const create = async ({ userId, title, priority = 'medium', category = 'General', deadline = null }) => {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO tasks (id, user_id, title, priority, category, deadline) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, title, priority, category, deadline || null]
  );
  return findByIdForUser(id, userId);
};

const findByIdForUser = async (id, userId) => {
  const rows = await query('SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return toTask(rows[0]);
};

const update = async (id, userId, fields) => {
  const current = await findByIdForUser(id, userId);
  if (!current) return null;

  await query(
    `UPDATE tasks
     SET title = ?, priority = ?, category = ?, deadline = ?, completed = ?
     WHERE id = ? AND user_id = ?`,
    [
      fields.title !== undefined ? fields.title : current.title,
      fields.priority !== undefined ? fields.priority : current.priority,
      fields.category !== undefined ? fields.category : current.category,
      fields.deadline !== undefined ? fields.deadline : current.deadline,
      fields.completed !== undefined ? fields.completed : current.completed,
      id,
      userId,
    ]
  );

  return findByIdForUser(id, userId);
};

const remove = async (id, userId) => {
  const rows = await query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
  return rows.affectedRows > 0;
};

module.exports = { create, findByIdForUser, listByUser, remove, update };
