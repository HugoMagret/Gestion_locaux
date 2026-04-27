const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuration middlewares
app.use(cors());
app.use(express.json());

// Mode Mock (activable via Docker Compose)
const IS_MOCK_MODE = process.env.MOCK_MODE === 'true';

if (IS_MOCK_MODE) {
  console.log("-----------------------------------------");
  console.log("🚀 BACKEND : MODE MOCK ACTIVÉ");
  console.log("📢 Les données sont statiques (pas de DB)");
  console.log("-----------------------------------------");
  
  const mockRooms = [
    { 
      id: "mock-1", 
      name: "Salle Mockée 101", 
      max_capacity: 10, 
      doors: 1, 
      floor: 0, 
      color: "#9b59b6", 
      coordinates: { x: 50, y: 50, width: 200, height: 150 },
      staff: [{ id: "s-1", first_name: "Jean", last_name: "Mock" }],
      equipments: [{ id: "e-1", name: "Ordinateur Mock", serial_number: "MOCK-PC" }],
      sockets: [{ id: "so-1", identifier: "ETH-M01" }]
    }
  ];

  // Routes Mockées (GET)
  app.get('/api/rooms', (req, res) => res.json(mockRooms));
  app.get('/api/staff', (req, res) => res.json(mockRooms[0].staff));
  app.get('/api/equipment', (req, res) => res.json(mockRooms[0].equipments));
  app.get('/api/types/room', (req, res) => res.json([
    {id: "rt-1", label: "Bureau"},
    {id: "rt-2", label: "Salle de cours"},
    {id: "rt-3", label: "Amphithéâtre"},
    {id: "rt-4", label: "Laboratoire"},
    {id: "rt-5", label: "Réunion"}
  ]));
  app.get('/api/types/equipment', (req, res) => res.json([
    {id: "et-1", label: "Vidéoprojecteur"},
    {id: "et-2", label: "Ordinateur Fixe"},
    {id: "et-3", label: "Imprimante 3D"},
    {id: "et-4", label: "Scanner"},
    {id: "et-5", label: "Tableau blanc"}
  ]));
  app.get('/api/types/socket', (req, res) => res.json([
    {id: "st-1", label: "Prise Électrique"},
    {id: "st-2", label: "Réseau (RJ45)"},
    {id: "st-3", label: "HDMI"},
    {id: "st-4", label: "Fibre Optique"}
  ]));

  // Routes Mockées (POST/PUT/DELETE)
  app.post('/api/rooms', (req, res) => res.status(201).json({id: "new-mock-id", ...req.body}));
  app.put('/api/rooms/:id', (req, res) => res.json({id: req.params.id, ...req.body}));
  app.delete('/api/rooms/:id', (req, res) => res.status(204).send());
  
  app.post('/api/rooms/:id/staff', (req, res) => res.status(201).json({id: "s-new", ...req.body}));
  app.post('/api/rooms/:id/equipment', (req, res) => res.status(201).json({id: "e-new", ...req.body}));

  // Routes POST gnriques (ajouts directs)
  app.post('/api/staff', (req, res) => res.status(201).json({id: "s-gen-new", ...req.body}));
  app.post('/api/equipment', (req, res) => res.status(201).json({id: "e-gen-new", ...req.body}));
  app.post('/api/sockets', (req, res) => res.status(201).json({id: "so-gen-new", ...req.body}));

} else {
  // Routes réelles (Base de données) - Modulaire
  console.log("-----------------------------------------");
  console.log("🗄️  BACKEND : MODE BASE DE DONNÉES (DB)");
  console.log("-----------------------------------------");
  
  const roomRoutes = require('./routes/rooms');
  const staffRoutes = require('./routes/staff');
  const equipmentRoutes = require('./routes/equipment');
  const socketRoutes = require('./routes/sockets');
  const typeRoutes = require('./routes/types');

  app.use('/api/rooms', roomRoutes);
  app.use('/api/staff', staffRoutes);
  app.use('/api/equipment', equipmentRoutes);
  app.use('/api/sockets', socketRoutes);
  app.use('/api/types', typeRoutes);
}

// Route de base
app.get('/', (req, res) => {
  res.json({ message: "API Gestion Locaux opérationnelle", mock_mode: IS_MOCK_MODE });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
