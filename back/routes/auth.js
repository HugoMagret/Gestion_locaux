const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyPassword, hashPassword } = require('../config/auth');

// POST login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id, login, password, is_admin FROM "user" WHERE login = $1',
      [login]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      
      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }
      // Update last connection
      await db.query('UPDATE "user" SET last_connection = NOW() WHERE id = $1', [user.id]);
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          login: user.login, 
          is_admin: user.is_admin 
        },
        token: 'fake-jwt-token-' + user.id // Simple token for now
      });
    } else {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST change-password
router.post('/change-password', async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashedPassword = hashPassword(newPassword);
    await db.query('UPDATE "user" SET password = $1 WHERE id = $2', [hashedPassword, userId]);
    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
