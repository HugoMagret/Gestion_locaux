const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/floors/import
// Importe un étage complet avec toutes ses salles via une transaction SQL
router.post('/import', async (req, res) => {
  const { level, rooms, doors } = req.body;
  
  if (level === undefined || !Array.isArray(rooms)) {
    return res.status(400).json({ error: 'Format invalide : level et rooms sont requis' });
  }

  // On récupère un client dédié pour la transaction depuis le pool
  const client = await db.pool.connect();

  try {
    // Début de la transaction
    await client.query('BEGIN');
    
    const insertedRooms = [];
    
    // Insertion de chaque salle
    for (const r of rooms) {
      let room_type_id = r.room_type_id;
      if (room_type_id === "" || room_type_id === undefined) {
        room_type_id = null;
      }
      
      const floor = r.floor !== undefined ? r.floor : level;
      const doorsCount = r.doors || 1;
      const color = r.color || '#3498db';

      const result = await client.query(
        `INSERT INTO room (name, max_capacity, room_type_id, doors, floor, coordinates, color) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id, name, max_capacity, room_type_id, doors, floor, coordinates, color`,
        [r.name, r.max_capacity, room_type_id, doorsCount, floor, r.coordinates, color]
      );
      insertedRooms.push(result.rows[0]);
    }

    const insertedDoors = [];
    // Insertion de chaque porte si présent
    if (doors && Array.isArray(doors)) {
      for (const d of doors) {
        const floor = d.floor !== undefined ? d.floor : level;
        const result = await client.query(
          `INSERT INTO door (floor, coordinates) VALUES ($1, $2) RETURNING id, floor, coordinates`,
          [floor, d.coordinates || d]
        );
        insertedDoors.push(result.rows[0]);
      }
    }

    // Si tout s'est bien passé, on valide la transaction
    await client.query('COMMIT');
    res.status(201).json({ message: `Étage ${level} importé avec succès`, rooms: insertedRooms, doors: insertedDoors });
    
  } catch (err) {
    // En cas d'erreur (ex: erreur de type, contrainte de bdd), on annule tout
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Erreur lors de l'import, annulation complète : " + err.message });
  } finally {
    // Libération du client pour qu'il retourne dans le pool
    client.release();
  }
});

// DELETE /api/floors/:level
// Supprime un étage complet (salles et portes)
router.delete('/:level', async (req, res) => {
  const level = parseInt(req.params.level);
  if (isNaN(level)) {
    return res.status(400).json({ error: "Niveau d'étage invalide" });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Supprimer toutes les salles de cet étage
    await client.query('DELETE FROM room WHERE floor = $1', [level]);
    
    // Supprimer toutes les portes de cet étage
    await client.query('DELETE FROM door WHERE floor = $1', [level]);
    
    await client.query('COMMIT');
    res.status(204).send();
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
