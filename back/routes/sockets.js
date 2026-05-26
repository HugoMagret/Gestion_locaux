const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all sockets
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT socket.id, socket.identifier, socket.socket_type_id, socket.room_id, socket_type.label as socket_type_label, room.name as room_name 
      FROM socket 
      LEFT JOIN socket_type ON socket.socket_type_id = socket_type.id
      LEFT JOIN room ON socket.room_id = room.id
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
      'INSERT INTO socket (identifier, socket_type_id, room_id) VALUES ($1, $2, $3) RETURNING id, identifier, socket_type_id, room_id',
      [identifier, socket_type_id, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update socket
router.put('/:id', async (req, res) => {
  let { identifier, socket_type_id, room_id } = req.body;
  if (room_id === '') room_id = null;

  try {
    const result = await db.query(
      'UPDATE socket SET identifier = $1, socket_type_id = $2, room_id = $3 WHERE id = $4 RETURNING id, identifier, socket_type_id, room_id',
      [identifier, socket_type_id, room_id, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Connectique non trouvée' });
    }
    res.json(result.rows[0]);
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
