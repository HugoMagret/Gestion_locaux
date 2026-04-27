const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuration de la connexion à la base de données
// On utilise l'URL fournie par Docker Compose ou une valeur par défaut
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@db:5432/gestion_locaux',
});

// Mode Mock (activable via Docker Compose)
const IS_MOCK_MODE = process.env.MOCK_MODE === 'true';

const MOCK_DATA = {
  rooms: [
    { id: "mock-1", name: "Salle Mockée 101", max_capacity: 10, doors: 1, floor: 0, color: "#9b59b6", coordinates: { x: 10, y: 10, width: 50, height: 50 }, staff: [], equipments: [], sockets: [] },
    { id: "mock-2", name: "Salle Mockée 102", max_capacity: 20, doors: 2, floor: 1, color: "#34495e", coordinates: { x: 70, y: 10, width: 80, height: 60 }, staff: [], equipments: [], sockets: [] }
  ]
};

app.use(cors());
app.use(express.json());

// --- ROUTES POUR LES SALLES (ROOMS) ---

// Récupérer toutes les salles (avec détails)
app.get('/api/rooms', async (req, res) => {
  if (IS_MOCK_MODE) {
    console.log("Mode Mock activé : renvoi de données statiques");
    return res.json(MOCK_DATA.rooms);
  }

  try {
    const result = await pool.query(`
      SELECT r.*, 
             rt.label as room_type_label,
             (SELECT json_agg(s) FROM staff s WHERE s.room_id = r.id) as staff,
             (SELECT json_agg(e) FROM equipment e WHERE e.room_id = r.id) as equipments,
             (SELECT json_agg(so) FROM socket so WHERE so.room_id = r.id) as sockets
      FROM room r
      LEFT JOIN room_type rt ON r.room_type_id = rt.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des salles' });
  }
});

// Créer une salle
app.post('/api/rooms', async (req, res) => {
  const { name, max_capacity, room_type_id, doors, coordinates, floor, color } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO room (name, max_capacity, room_type_id, doors, coordinates, floor, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, max_capacity, room_type_id, doors, coordinates, floor || 0, color || '#3498db']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une salle
app.delete('/api/rooms/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM room WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTES POUR LE PERSONNEL (STAFF) ---

app.get('/api/staff', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM staff');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/staff', async (req, res) => {
  const { first_name, last_name, room_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO staff (first_name, last_name, room_id) VALUES ($1, $2, $3) RETURNING *',
      [first_name, last_name, room_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTES POUR L'ÉQUIPEMENT ---

app.get('/api/equipment', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ROUTES POUR LES TYPES (DICTIONNAIRES) ---

app.get('/api/types/room', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM room_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/types/room', async (req, res) => {
  const { label } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO room_type (label) VALUES ($1) RETURNING *',
      [label]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/types/room/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM room_type WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/types/equipment', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_type ORDER BY label');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/types/equipment', async (req, res) => {
  const { label } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO equipment_type (label) VALUES ($1) RETURNING *',
      [label]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/types/equipment/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM equipment_type WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
