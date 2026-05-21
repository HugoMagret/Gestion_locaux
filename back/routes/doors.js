const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all doors (optional filter by floor)
router.get('/', async (req, res) => {
  const { floor } = req.query;
  let query = 'SELECT * FROM door';
  let params = [];

  if (floor !== undefined) {
    query += ' WHERE floor = $1';
    params.push(floor);
  }

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE door
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM door WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
