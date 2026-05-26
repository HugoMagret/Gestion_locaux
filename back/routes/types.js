const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { roomTypeSchema, equipmentTypeSchema, socketTypeSchema } = require('../validators/schemas');

// ROOM TYPES
router.get('/room', async (req, res) => {
  try {
    const types = await prisma.roomType.findMany({ orderBy: { label: 'asc' } });
    res.json(types);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/room', verifyAdmin, validate(roomTypeSchema), async (req, res) => {
  try {
    const type = await prisma.roomType.create({ data: req.body });
    res.status(201).json(type);
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

router.delete('/room/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.roomType.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// EQUIPMENT TYPES
router.get('/equipment', async (req, res) => {
  try {
    const types = await prisma.equipmentType.findMany({ orderBy: { label: 'asc' } });
    res.json(types);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/equipment', verifyAdmin, validate(equipmentTypeSchema), async (req, res) => {
  try {
    const type = await prisma.equipmentType.create({ data: req.body });
    res.status(201).json(type);
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

router.delete('/equipment/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.equipmentType.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SOCKET TYPES
router.get('/socket', async (req, res) => {
  try {
    const types = await prisma.socketType.findMany({ orderBy: { label: 'asc' } });
    res.json(types);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/socket', verifyAdmin, validate(socketTypeSchema), async (req, res) => {
  try {
    const type = await prisma.socketType.create({ data: req.body });
    res.status(201).json(type);
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

router.delete('/socket/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.socketType.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
