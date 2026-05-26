const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const toUser = (row, includePassword = false) => {
  if (!row) return null;

  const user = {
    _id: row.id,
    id: row.id,
    username: row.username,
    email: row.email,
    streak: row.streak,
    lastActive: row.last_active,
    createdAt: row.created_at,
  };

  if (includePassword) {
    user.password = row.password;
  }

  return user;
};

const create = async ({ username, email, password, streak = 0, lastActive = new Date() }) => {
  const id = crypto.randomUUID();
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

  await query(
    'INSERT INTO users (id, username, email, password, streak, last_active) VALUES (?, ?, ?, ?, ?, ?)',
    [id, username, email, hashedPassword, streak, lastActive]
  );

  return findById(id);
};

const findByEmailOrUsername = async (email, username) => {
  const rows = await query('SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1', [email, username]);
  return toUser(rows[0], true);
};

const findByEmail = async (email) => {
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return toUser(rows[0], true);
};

const findById = async (id) => {
  const rows = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
  return toUser(rows[0]);
};

const updateActivity = async (id, { streak, lastActive }) => {
  await query('UPDATE users SET streak = ?, last_active = ? WHERE id = ?', [streak, lastActive, id]);
  return findById(id);
};

const matchPassword = async (enteredPassword, hashedPassword) => {
  return bcrypt.compare(enteredPassword, hashedPassword);
};

module.exports = {
  create,
  findByEmail,
  findByEmailOrUsername,
  findById,
  matchPassword,
  updateActivity,
};
