const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { staffSchema } = require('../validators/schemas');

// GET all staff
router.get('/', async (req, res) => {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        room: { select: { name: true, room_type_id: true } }
      },
      orderBy: { last_name: 'asc' }
    });
    // Flatten room info for frontend compatibility
    const formattedStaff = staff.map(s => ({
      ...s,
      room_name: s.room?.name || null
    }));
    res.json(formattedStaff);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new staff
router.post('/', verifyAdmin, validate(staffSchema), async (req, res) => {
  try {
    const staff = await prisma.staff.create({
      data: req.body,
      include: { room: { select: { name: true } } }
    });
    res.status(201).json({ ...staff, room_name: staff.room?.name || null });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// PUT update staff
router.put('/:id', verifyAdmin, validate(staffSchema), async (req, res) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: req.body,
      include: { room: { select: { name: true } } }
    });
    res.json({ ...staff, room_name: staff.room?.name || null });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// DELETE staff
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.staff.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
