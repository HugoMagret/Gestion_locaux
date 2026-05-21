const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT staff.id, staff.last_name, staff.first_name, staff.email, staff.phone, staff.room_id, room.name as room_name FROM staff LEFT JOIN room ON staff.room_id = room.id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new staff
router.post('/', async (req, res) => {
  let { first_name, last_name, email, phone, room_id } = req.body;
  if (room_id === "") room_id = null; // Transformer "" en NULL pour PostgreSQL
  try {
    const result = await db.query(
      'INSERT INTO staff (first_name, last_name, email, phone, room_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, phone, room_id',
      [first_name, last_name, email, phone, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update staff
router.put('/:id', async (req, res) => {
  const { first_name, last_name, email, phone, room_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE staff SET first_name = $1, last_name = $2, email = $3, phone = $4, room_id = $5 WHERE id = $6 RETURNING id, first_name, last_name, email, phone, room_id',
      [first_name, last_name, email, phone, room_id, req.params.id]
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
