const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- HELPER POUR CRUD GÉNÉRIQUE ---
// Pour éviter de répéter le code, on crée une fonction qui gère les types
const createTypeRoutes = (tableName, path) => {
  // GET all
  router.get(`/${path}`, async (req, res) => {
    try {
      const result = await db.query(`SELECT id, label FROM ${tableName} ORDER BY label`);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST new
  router.post(`/${path}`, async (req, res) => {
    const { label } = req.body;
    try {
      const result = await db.query(`INSERT INTO ${tableName} (label) VALUES ($1) RETURNING id, label`, [label]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT update
  router.put(`/${path}/:id`, async (req, res) => {
    const { label } = req.body;
    try {
      const result = await db.query(`UPDATE ${tableName} SET label = $1 WHERE id = $2 RETURNING id, label`, [label, req.params.id]);
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
