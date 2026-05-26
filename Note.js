const crypto = require('crypto');
const { query } = require('../config/db');

const toNote = (row) => row && ({
  _id: row.id,
  userId: row.user_id,
  title: row.title,
  content: row.content,
  folder: row.folder,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listByUser = async (userId) => {
  const rows = await query('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
  return rows.map(toNote);
};

const create = async ({ userId, title = 'Untitled Note', content = '', folder = 'General' }) => {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO notes (id, user_id, title, content, folder) VALUES (?, ?, ?, ?, ?)',
    [id, userId, title, content, folder]
  );
  return findByIdForUser(id, userId);
};

const findByIdForUser = async (id, userId) => {
  const rows = await query('SELECT * FROM notes WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return toNote(rows[0]);
};

const update = async (id, userId, fields) => {
  const current = await findByIdForUser(id, userId);
  if (!current) return null;

  await query(
    'UPDATE notes SET title = ?, content = ?, folder = ? WHERE id = ? AND user_id = ?',
    [
      fields.title !== undefined ? fields.title : current.title,
      fields.content !== undefined ? fields.content : current.content,
      fields.folder !== undefined ? fields.folder : current.folder,
      id,
      userId,
    ]
  );

  return findByIdForUser(id, userId);
};

const remove = async (id, userId) => {
  const rows = await query('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
  return rows.affectedRows > 0;
};

module.exports = { create, findByIdForUser, listByUser, remove, update };
