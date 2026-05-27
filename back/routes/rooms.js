const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { roomSchema } = require('../validators/schemas');

// GET all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        roomType: { select: { color: true, label: true } },
        staff: true,
        equipments: true,
        sockets: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Flatten data to match frontend expectations
    const formattedRooms = rooms.map(room => ({
      ...room,
      color: room.roomType?.color || '#3498db',
      room_type_label: room.roomType?.label || null,
      staffCount: room.staff.length,
      equipmentCount: room.equipments.length,
      socketCount: room.sockets.length
    }));
    
    res.json(formattedRooms);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET rooms by floor
router.get('/floor/:floor', async (req, res) => {
  try {
    const floor = parseInt(req.params.floor);
    const rooms = await prisma.room.findMany({
      where: { floor: floor },
      include: {
        roomType: { select: { color: true, label: true } },
        staff: true,
        equipments: true,
        sockets: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Flatten data to match frontend expectations
    const formattedRooms = rooms.map(room => ({
      ...room,
      color: room.roomType?.color || '#3498db',
      room_type_label: room.roomType?.label || null,
      staffCount: room.staff.length,
      equipmentCount: room.equipments.length,
      socketCount: room.sockets.length
    }));
    
    res.json(formattedRooms);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single room
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { id: req.params.id },
      include: {
        roomType: { select: { color: true, label: true } },
        staff: true,
        equipments: true,
        sockets: true
      }
    });

    if (!room) return res.status(404).json({ success: false, message: 'Salle introuvable' });

    res.json({
      ...room,
      color: room.roomType?.color || '#3498db',
      room_type_label: room.roomType?.label || null,
      staffCount: room.staff.length,
      equipmentCount: room.equipments.length,
      socketCount: room.sockets.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new room
router.post('/', verifyAdmin, validate(roomSchema), async (req, res) => {
  try {
    const room = await prisma.room.create({
      data: req.body,
      include: {
        roomType: { select: { color: true, label: true } },
        staff: true,
        equipments: true,
        sockets: true
      }
    });
    res.status(201).json({
      ...room,
      color: room.roomType?.color || '#3498db',
      room_type_label: room.roomType?.label || null,
      staffCount: room.staff.length,
      equipmentCount: room.equipments.length,
      socketCount: room.sockets.length
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// PUT update room
router.put('/:id', verifyAdmin, validate(roomSchema), async (req, res) => {
  try {
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        roomType: { select: { color: true, label: true } },
        staff: true,
        equipments: true,
        sockets: true
      }
    });
    res.json({
      ...room,
      color: room.roomType?.color || '#3498db',
      room_type_label: room.roomType?.label || null,
      staffCount: room.staff.length,
      equipmentCount: room.equipments.length,
      socketCount: room.sockets.length
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// DELETE room
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.room.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update room coordinates
router.put('/:id/coordinates', verifyAdmin, async (req, res) => {
  const { coordinates } = req.body;
  try {
    const room = await prisma.room.update({
      where: { id: req.params.id },
      data: { coordinates }
    });
    res.json(room);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
