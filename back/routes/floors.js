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

// PUT /api/floors/:level
// Met à jour le contenu JSON d'un étage sans casser les identifiants existants
router.put('/:level', async (req, res) => {
  const level = parseInt(req.params.level);
  const { rooms, doors } = req.body;

  if (isNaN(level)) {
    return res.status(400).json({ error: "Niveau d'étage invalide" });
  }

  if (!Array.isArray(rooms)) {
    return res.status(400).json({ error: 'Format invalide : rooms doit être un tableau' });
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    for (const r of rooms) {
      let roomTypeId = r.room_type_id;
      if (roomTypeId === '' || roomTypeId === undefined) {
        roomTypeId = null;
      }

      const roomCoordinates = r.coordinates || { x: 0, y: 0, width: 100, height: 100 };
      const doorsCount = r.doors !== undefined ? r.doors : 1;

      if (r.id) {
        await client.query(
          'UPDATE room SET name = $1, max_capacity = $2, room_type_id = $3, doors = $4, floor = $5, coordinates = $6 WHERE id = $7 AND floor = $8',
          [r.name, r.max_capacity, roomTypeId, doorsCount, level, JSON.stringify(roomCoordinates), r.id, level]
        );
      } else {
        await client.query(
          'INSERT INTO room (name, max_capacity, room_type_id, doors, floor, coordinates) VALUES ($1, $2, $3, $4, $5, $6)',
          [r.name, r.max_capacity, roomTypeId, doorsCount, level, JSON.stringify(roomCoordinates)]
        );
      }
    }

    if (Array.isArray(doors)) {
      for (const d of doors) {
        const doorCoordinates = d.coordinates || d;
        const doorFloor = d.floor !== undefined ? d.floor : level;

        if (d.id) {
          await client.query(
            'UPDATE door SET floor = $1, coordinates = $2 WHERE id = $3',
            [doorFloor, JSON.stringify(doorCoordinates), d.id]
          );
        } else {
          await client.query(
            'INSERT INTO door (floor, coordinates) VALUES ($1, $2)',
            [doorFloor, JSON.stringify(doorCoordinates)]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Étage ${level} mis à jour avec succès` });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// DELETE /api/floors/:level
// Supprime un étage complet (salles et portes)
// router.delete('/:level', async (req, res) => {
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
