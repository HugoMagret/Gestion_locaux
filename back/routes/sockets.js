const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all sockets
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, st.label as socket_type_label, r.name as room_name 
      FROM socket s 
      LEFT JOIN socket_type st ON s.socket_type_id = st.id
      LEFT JOIN room r ON s.room_id = r.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new socket
router.post('/', async (req, res) => {
  const { identifier, socket_type_id, room_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO socket (identifier, socket_type_id, room_id) VALUES ($1, $2, $3) RETURNING *',
      [identifier, socket_type_id, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE socket
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM socket WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
