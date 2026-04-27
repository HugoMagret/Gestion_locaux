const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, 
             rt.label as room_type_label,
             (SELECT json_agg(s) FROM staff s WHERE s.room_id = r.id) as staff,
             (SELECT json_agg(e) FROM equipment e WHERE e.room_id = r.id) as equipments,
             (SELECT json_agg(so) FROM socket so WHERE so.room_id = r.id) as sockets
      FROM room r
      LEFT JOIN room_type rt ON r.room_type_id = rt.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one room by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM room WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Salle non trouvée' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new room
router.post('/', async (req, res) => {
  const { name, max_capacity, room_type_id, doors, floor, coordinates, color } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO room (name, max_capacity, room_type_id, doors, floor, coordinates, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, max_capacity, room_type_id, doors, floor || 0, coordinates, color || '#3498db']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update room
router.put('/:id', async (req, res) => {
  const { name, max_capacity, room_type_id, doors, floor, coordinates, color } = req.body;
  try {
    const result = await db.query(
        'UPDATE room SET name = $1, max_capacity = $2, room_type_id = $3, doors = $4, floor = $5, coordinates = $6, color = $7 WHERE id = $8 RETURNING *',
        [name, max_capacity, room_type_id, doors, floor, coordinates, color, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE room
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM room WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTES DE COMMODITÉ (SETTERS) ---

// Ajouter un membre du personnel directement dans cette salle
router.post('/:id/staff', async (req, res) => {
  const { first_name, last_name } = req.body;
  const room_id = req.params.id;
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

// Ajouter un équipement directement dans cette salle
router.post('/:id/equipment', async (req, res) => {
  const { name, serial_number, equipment_type_id } = req.body;
  const room_id = req.params.id;
  try {
    const result = await db.query(
      'INSERT INTO equipment (name, serial_number, equipment_type_id, room_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, serial_number, equipment_type_id, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
