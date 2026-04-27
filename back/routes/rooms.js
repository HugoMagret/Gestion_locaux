const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all rooms (WITH FILTERS)
router.get('/', async (req, res) => {
  const { floor, min_doors, min_capacity, type, min_sockets } = req.query;
  
  let query = `
    SELECT r.id, r.name, r.max_capacity, r.room_type_id, r.doors, r.floor, r.coordinates, r.color, 
           rt.label as room_type_label,
           (SELECT json_agg(json_build_object('id', s.id, 'first_name', s.first_name, 'last_name', s.last_name)) FROM staff s WHERE s.room_id = r.id) as staff,
           (SELECT json_agg(json_build_object('id', e.id, 'name', e.name, 'serial_number', e.serial_number)) FROM equipment e WHERE e.room_id = r.id) as equipments,
           (SELECT json_agg(json_build_object('id', so.id, 'identifier', so.identifier)) FROM socket so WHERE so.room_id = r.id) as sockets
    FROM room r
    LEFT JOIN room_type rt ON r.room_type_id = rt.id
    WHERE 1=1
  `;
  
  const params = [];
  let paramIdx = 1;

  if (floor !== undefined) {
    query += ` AND r.floor = $${paramIdx++}`;
    params.push(parseInt(floor));
  }

  if (min_doors !== undefined) {
    query += ` AND r.doors >= $${paramIdx++}`;
    params.push(parseInt(min_doors));
  }

  if (min_capacity !== undefined) {
    query += ` AND r.max_capacity >= $${paramIdx++}`;
    params.push(parseInt(min_capacity));
  }

  if (type !== undefined) {
    query += ` AND r.room_type_id = $${paramIdx++}`;
    params.push(type);
  }

  if (min_sockets !== undefined) {
    query += ` AND (SELECT count(*) FROM socket so WHERE so.room_id = r.id) >= $${paramIdx++}`;
    params.push(parseInt(min_sockets));
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one room by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, max_capacity, room_type_id, doors, floor, coordinates, color FROM room WHERE id = $1', [req.params.id]);
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
