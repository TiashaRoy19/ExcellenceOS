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

const toDeck = (row) => row && ({
  _id: row.id,
  userId: row.user_id,
  deckName: row.deck_name,
  cards: parseJson(row.cards, []),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const listByUser = async (userId) => {
  const rows = await query('SELECT * FROM flashcards WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(toDeck);
};

const create = async ({ userId, deckName, cards = [] }) => {
  const id = crypto.randomUUID();
  await query(
    'INSERT INTO flashcards (id, user_id, deck_name, cards) VALUES (?, ?, ?, ?)',
    [id, userId, deckName, JSON.stringify(cards)]
  );
  const rows = await query('SELECT * FROM flashcards WHERE id = ? AND user_id = ? LIMIT 1', [id, userId]);
  return toDeck(rows[0]);
};

const remove = async (id, userId) => {
  const rows = await query('DELETE FROM flashcards WHERE id = ? AND user_id = ?', [id, userId]);
  return rows.affectedRows > 0;
};

module.exports = { create, listByUser, remove };
