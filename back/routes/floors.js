const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { verifyAdmin } = require('../middleware/auth.middleware');

// POST import full floor (Monolithic JSON)
router.post('/import', verifyAdmin, async (req, res) => {
  const floorData = req.body;
  if (!floorData || !floorData.level || !Array.isArray(floorData.rooms) || !Array.isArray(floorData.doors)) {
    return res.status(400).json({ success: false, message: 'Format JSON invalide' });
  }

  try {
    // We use Prisma $transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing rooms and doors for this floor
      await tx.room.deleteMany({ where: { floor: floorData.level } });
      await tx.door.deleteMany({ where: { floor: floorData.level } });

      // 2. Insert rooms
      for (const room of floorData.rooms) {
        // Find room type by label or create it if missing
        let roomType = null;
        if (room.room_type_label) {
          roomType = await tx.roomType.findUnique({
            where: { label: room.room_type_label }
          });
          if (!roomType) {
             // Create on the fly with default color
             roomType = await tx.roomType.create({
               data: { 
                 label: room.room_type_label, 
                 color: room.color || '#3498db' 
               }
             });
          }
        }

        await tx.room.create({
          data: {
            name: room.name,
            floor: floorData.level,
            max_capacity: room.max_capacity || null,
            room_type_id: roomType ? roomType.id : null,
            doors: room.doors_count || 1,
            coordinates: room.coordinates
          }
        });
      }

      // 3. Insert doors
      for (const door of floorData.doors) {
        await tx.door.create({
          data: {
            floor: floorData.level,
            coordinates: door.coordinates
          }
        });
      }
    });

    res.status(201).json({ success: true, message: 'Étage importé avec succès (Transaction réussie)' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'import: ' + err.message });
  }
});

// DELETE complete floor
router.delete('/:level', verifyAdmin, async (req, res) => {
  const level = parseInt(req.params.level);
  try {
    // Prisma will handle cascading deletes because of the @relation(onDelete: Cascade/SetNull)
    // But since Room deletes cascade to Sockets/Equipments, and SET NULL for Staff,
    // we just need to delete rooms and doors of that floor.
    await prisma.$transaction(async (tx) => {
      await tx.room.deleteMany({ where: { floor: level } });
      await tx.door.deleteMany({ where: { floor: level } });
    });
    
    res.json({ success: true, message: `Étage ${level} et toutes ses données associées ont été supprimés.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
