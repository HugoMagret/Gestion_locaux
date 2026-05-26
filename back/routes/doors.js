const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');

// GET all doors (or by floor via query param)
router.get('/', async (req, res) => {
  try {
    let whereClause = {};
    if (req.query.floor !== undefined) {
      whereClause.floor = parseInt(req.query.floor);
    }
    const doors = await prisma.door.findMany({ where: whereClause });
    res.json(doors);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET doors by floor
router.get('/floor/:floor', async (req, res) => {
  try {
    const doors = await prisma.door.findMany({
      where: { floor: parseInt(req.params.floor) }
    });
    res.json(doors);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new door
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const door = await prisma.door.create({
      data: req.body
    });
    res.status(201).json(door);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE door
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.door.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
