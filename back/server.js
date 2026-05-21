const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Configuration middlewares
app.use(cors());
app.use(express.json());

// Routes réelles (Base de données) - Modulaire
console.log("-----------------------------------------");
console.log("🗄️  BACKEND : MODE BASE DE DONNÉES (DB)");
console.log("-----------------------------------------");

const roomRoutes = require('./routes/rooms');
const staffRoutes = require('./routes/staff');
const equipmentRoutes = require('./routes/equipment');
const socketRoutes = require('./routes/sockets');
const typeRoutes = require('./routes/types');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const floorRoutes = require('./routes/floors');
const doorRoutes = require('./routes/doors');

app.use('/api/rooms', roomRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/sockets', socketRoutes);
app.use('/api/types', typeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/floors', floorRoutes);
app.use('/api/doors', doorRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: "API Gestion Locaux opérationnelle" });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
