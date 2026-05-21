const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- HELPER POUR CRUD GÉNÉRIQUE ---
// Pour éviter de répéter le code, on crée une fonction qui gère les types
const createTypeRoutes = (tableName, path) => {
  const isRoomType = tableName === 'room_type';

  // GET all
  router.get(`/${path}`, async (req, res) => {
    try {
      const selectFields = isRoomType ? 'id, label, color' : 'id, label';
      const result = await db.query(`SELECT ${selectFields} FROM ${tableName} ORDER BY label`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST new
  router.post(`/${path}`, async (req, res) => {
    const { label, color } = req.body;
    try {
      let result;
      if (isRoomType) {
        result = await db.query(`INSERT INTO ${tableName} (label, color) VALUES ($1, $2) RETURNING id, label, color`, [label, color || '#3498db']);
      } else {
        result = await db.query(`INSERT INTO ${tableName} (label) VALUES ($1) RETURNING id, label`, [label]);
      }
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put(`/${path}/:id`, async (req, res) => {
    const { label, color } = req.body;
    try {
      let result;
      if (isRoomType) {
        result = await db.query(`UPDATE ${tableName} SET label = $1, color = $2 WHERE id = $3 RETURNING id, label, color`, [label, color, req.params.id]);
      } else {
        result = await db.query(`UPDATE ${tableName} SET label = $1 WHERE id = $2 RETURNING id, label`, [label, req.params.id]);
      }
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE
  router.delete(`/${path}/:id`, async (req, res) => {
    try {
      await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [req.params.id]);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

// --- GÉNÉRATION DES ROUTES ---
createTypeRoutes('room_type', 'room');
createTypeRoutes('equipment_type', 'equipment');
createTypeRoutes('socket_type', 'socket');

module.exports = router;
