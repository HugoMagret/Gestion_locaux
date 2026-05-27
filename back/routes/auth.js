const express = require('express');
const router = express.Router();
const { verifyPassword, hashPassword } = require('../config/auth');
const jwt = require('jsonwebtoken');
const { verifyToken, JWT_SECRET } = require('../middleware/auth.middleware');
const prisma = require('../config/prisma');

// POST login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { login }
    });

    if (user) {
      if (!verifyPassword(password, user.password)) {
        return res.status(401).json({ success: false, message: 'Identifiants incorrects' });
      }
      
      // Update last connection
      await prisma.user.update({
        where: { id: user.id },
        data: { last_connection: new Date() }
      });
      
      const token = jwt.sign(
        { 
          id: user.id, 
          login: user.login, 
          is_admin: user.is_admin 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          login: user.login, 
          is_admin: user.is_admin 
        },
        token: token
      });
    } else {
      res.status(401).json({ success: false, message: 'Identifiants incorrects' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST change-password (protected by verifyToken)
router.post('/change-password', verifyToken, async (req, res) => {
  const { userId, newPassword } = req.body;
  
  // Security check: must change own password OR be an admin
  if (req.user.id !== userId && !req.user.is_admin) {
    return res.status(403).json({ success: false, message: 'Non autorisé à modifier le mot de passe d\'un autre utilisateur' });
  }

  try {
    const hashedPassword = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    res.json({ success: true, message: 'Mot de passe mis à jour' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST verify-password (protected by verifyToken)
router.post('/verify-password', verifyToken, async (req, res) => {
  const { userId, password } = req.body;

  // Security check: must verify own password OR be an admin
  if (req.user.id !== userId && !req.user.is_admin) {
    return res.status(403).json({ success: false, message: 'Non autorisé' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable' });
    }

    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Mot de passe actuel incorrect' });
    }

    res.json({ success: true, message: 'Mot de passe vérifié' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST logout
router.post('/logout', async (req, res) => {
  res.json({ success: true, message: 'Déconnexion côté serveur effectuée' });
});

module.exports = router;
