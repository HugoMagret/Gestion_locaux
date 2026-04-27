const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all room types
router.get('/room', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM room_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all equipment types
router.get('/equipment', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM equipment_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all socket types
router.get('/socket', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM socket_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
