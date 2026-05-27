const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { equipmentSchema } = require('../validators/schemas');

// GET all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await prisma.equipment.findMany({
      include: {
        room: { select: { name: true, room_type_id: true } },
        equipmentType: { select: { label: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    // Flatten info for frontend
    const formattedEq = equipment.map(e => ({
      ...e,
      room_name: e.room?.name || null,
      equipment_type_label: e.equipmentType?.label || null
    }));
    res.json(formattedEq);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new equipment
router.post('/', verifyAdmin, validate(equipmentSchema), async (req, res) => {
  try {
    const equipment = await prisma.equipment.create({
      data: req.body,
      include: { 
        room: { select: { name: true } },
        equipmentType: { select: { label: true } }
      }
    });
    res.status(201).json({ 
      ...equipment, 
      room_name: equipment.room?.name || null,
      equipment_type_label: equipment.equipmentType?.label || null
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// PUT update equipment
router.put('/:id', verifyAdmin, validate(equipmentSchema), async (req, res) => {
  try {
    const equipment = await prisma.equipment.update({
      where: { id: req.params.id },
      data: req.body,
      include: { 
        room: { select: { name: true } },
        equipmentType: { select: { label: true } }
      }
    });
    res.json({ 
      ...equipment, 
      room_name: equipment.room?.name || null,
      equipment_type_label: equipment.equipmentType?.label || null
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// DELETE equipment
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.equipment.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
