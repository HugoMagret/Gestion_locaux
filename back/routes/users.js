const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { hashPassword } = require('../config/auth');

// Middleware de vérification Admin (simplifié pour l'exercice)
const adminOnly = (req, res, next) => {
  const isAdmin = req.headers['x-is-admin'] === 'true';
  if (!isAdmin) {
    return res.status(403).json({ success: false, message: 'Action réservée aux administrateurs' });
  }
  next();
};

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT id, login, is_admin, last_connection FROM "user" ORDER BY login');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new user
router.post('/', adminOnly, async (req, res) => {
  const { login, password, is_admin } = req.body;
  const hashedPassword = hashPassword(password);
  try {
    const result = await db.query(
      'INSERT INTO "user" (login, password, is_admin) VALUES ($1, $2, $3) RETURNING id, login, is_admin, last_connection',
      [login, hashedPassword, is_admin || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update user
router.put('/:id', adminOnly, async (req, res) => {
  const { login, password, is_admin } = req.body;
  const hashedPassword = hashPassword(password);
  try {
    const result = await db.query(
      'UPDATE "user" SET login = $1, password = $2, is_admin = $3 WHERE id = $4 RETURNING id, login, is_admin, last_connection',
      [login, hashedPassword, is_admin, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE user
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM "user" WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
