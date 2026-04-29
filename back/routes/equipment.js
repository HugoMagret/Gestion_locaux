const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT equipment.id, equipment.name, equipment.serial_number, equipment.equipment_type_id, equipment.room_id, equipment_type.label as equipment_type_label, room.name as room_name 
      FROM equipment 
      LEFT JOIN equipment_type ON equipment.equipment_type_id = equipment_type.id
      LEFT JOIN room ON equipment.room_id = room.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new equipment
router.post('/', async (req, res) => {
  let { name, serial_number, equipment_type_id, room_id } = req.body;
  
  if (!name || !serial_number || !equipment_type_id) {
    return res.status(400).json({ error: "Missing mandatory fields: name, serial_number and equipment_type_id are required." });
  }

  if (room_id === "") room_id = null;
  try {
    const result = await db.query(
      `INSERT INTO equipment (name, serial_number, equipment_type_id, room_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, serial_number, equipment_type_id, room_id,
       (SELECT label FROM equipment_type WHERE id = equipment_type_id) as equipment_type_label`,
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

  if (!name || !serial_number || !equipment_type_id) {
    return res.status(400).json({ error: "Name, serial_number and equipment_type_id are required for update." });
  }

  try {
    const result = await db.query(
      `UPDATE equipment SET name = $1, serial_number = $2, equipment_type_id = $3, room_id = $4 
       WHERE id = $5 
       RETURNING id, name, serial_number, equipment_type_id, room_id,
       (SELECT label FROM equipment_type WHERE id = equipment_type_id) as equipment_type_label`,
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
