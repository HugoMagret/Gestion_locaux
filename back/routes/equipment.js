const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT e.*, et.label as equipment_type_label, r.name as room_name 
      FROM equipment e 
      LEFT JOIN equipment_type et ON e.equipment_type_id = et.id
      LEFT JOIN room r ON e.room_id = r.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new equipment
router.post('/', async (req, res) => {
  const { name, serial_number, equipment_type_id, room_id } = req.body;
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

// PUT update equipment
router.put('/:id', async (req, res) => {
  const { name, serial_number, equipment_type_id, room_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE equipment SET name = $1, serial_number = $2, equipment_type_id = $3, room_id = $4 WHERE id = $5 RETURNING *',
      [name, serial_number, equipment_type_id, room_id, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE equipment
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM equipment WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
