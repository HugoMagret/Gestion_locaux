const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- ROOM TYPES ---
router.get('/room', async (req, res) => {
  try {
    const result = await db.query('SELECT id, label FROM room_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/room', async (req, res) => {
  const { label } = req.body;
  try {
    const result = await db.query('INSERT INTO room_type (label) VALUES ($1) RETURNING *', [label]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/room/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM room_type WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EQUIPMENT TYPES ---
router.get('/equipment', async (req, res) => {
  try {
    const result = await db.query('SELECT id, label FROM equipment_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/equipment', async (req, res) => {
  const { label } = req.body;
  try {
    const result = await db.query('INSERT INTO equipment_type (label) VALUES ($1) RETURNING *', [label]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/equipment/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM equipment_type WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SOCKET TYPES ---
router.get('/socket', async (req, res) => {
  try {
    const result = await db.query('SELECT id, label FROM socket_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
