const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@db:5432/gestion_locaux',
});

// Test de connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
  } else {
    console.log('Base de données connectée avec succès.');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};
