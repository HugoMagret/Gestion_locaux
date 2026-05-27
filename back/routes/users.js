const express = require('express');
const router = express.Router();
const { hashPassword } = require('../config/auth');
const { verifyAdmin } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { userSchema, userUpdateSchema } = require('../validators/schemas');
const prisma = require('../config/prisma');

// GET all users
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, login: true, is_admin: true, last_connection: true },
      orderBy: { login: 'asc' }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new user
router.post('/', verifyAdmin, validate(userSchema), async (req, res) => {
  const { login, password, is_admin } = req.body;
  const hashedPassword = hashPassword(password);
  try {
    const result = await db.query(
      'INSERT INTO "user" (login, password, is_admin, last_connection) VALUES ($1, $2, $3, NULL) RETURNING id, login, is_admin, last_connection',
      [login, hashedPassword, is_admin || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Un utilisateur avec ce login existe déjà.' });
    } else {
      res.status(409).json({ success: false, message: err.message });
    }
  }
});

// PUT update user
router.put('/:id', verifyAdmin, validate(userUpdateSchema), async (req, res) => {
  const { login, password, is_admin } = req.body;
  try {
    const dataToUpdate = { login, is_admin };
    if (password && password.length > 0) {
      dataToUpdate.password = hashPassword(password);
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: dataToUpdate,
      select: { id: true, login: true, is_admin: true, last_connection: true }
    });
    res.json(user);
  } catch (err) {
    if (err.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Un utilisateur avec ce login existe déjà.' });
    } else {
      res.status(409).json({ success: false, message: err.message });
    }
  }
});

// DELETE user
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
