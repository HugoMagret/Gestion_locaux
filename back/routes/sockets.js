const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { socketSchema } = require('../validators/schemas');

// GET all sockets
router.get('/', async (req, res) => {
  try {
    const sockets = await prisma.socket.findMany({
      include: {
        room: { select: { name: true, room_type_id: true } },
        socketType: { select: { label: true } }
      },
      orderBy: { identifier: 'asc' }
    });
    
    // Flatten info for frontend
    const formattedSockets = sockets.map(s => ({
      ...s,
      room_name: s.room?.name || null,
      socket_type_label: s.socketType?.label || null
    }));
    res.json(formattedSockets);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new socket
router.post('/', verifyAdmin, validate(socketSchema), async (req, res) => {
  try {
    const socket = await prisma.socket.create({
      data: req.body,
      include: { 
        room: { select: { name: true } },
        socketType: { select: { label: true } }
      }
    });
    res.status(201).json({ 
      ...socket, 
      room_name: socket.room?.name || null,
      socket_type_label: socket.socketType?.label || null
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});

// PUT update socket
router.put('/:id', verifyAdmin, validate(socketSchema), async (req, res) => {
  try {
    const socket = await prisma.socket.update({
      where: { id: req.params.id },
      data: req.body,
      include: { 
        room: { select: { name: true } },
        socketType: { select: { label: true } }
      }
    });
    res.json({ 
      ...socket, 
      room_name: socket.room?.name || null,
      socket_type_label: socket.socketType?.label || null
    });
  } catch (err) {
    res.status(409).json({ success: false, message: err.message });
  }
});


// DELETE socket
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.socket.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
