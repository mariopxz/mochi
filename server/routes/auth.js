require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');

// POST /auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificiar si el email ya existe
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email o el username ya está en uso' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Generar JWT
    const token = jwt.sign(
      { id: result.insertId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, username });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario
    const [users] = await db.query(
      'SELECT id, username, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, username: user.username });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// PUT /auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { bio } = req.body;

  try {
    await db.query(
      'UPDATE users SET bio = ? WHERE id = ?',
      [bio, req.user.id]
    );

    res.json({ message: 'Perfil actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;