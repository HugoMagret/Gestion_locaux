const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT s.*, r.name as room_name FROM staff s LEFT JOIN room r ON s.room_id = r.id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new staff
router.post('/', async (req, res) => {
  const { first_name, last_name, room_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO staff (first_name, last_name, room_id) VALUES ($1, $2, $3) RETURNING *',
      [first_name, last_name, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  const { first_name, last_name, room_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE staff SET first_name = $1, last_name = $2, room_id = $3 WHERE id = $4 RETURNING *',
      [first_name, last_name, room_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE staff
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM staff WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
