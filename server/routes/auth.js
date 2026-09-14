require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { normalizeSpaces, removeAllSpaces, scapeHtml } = require('../utils/sanitize');

// POST /auth/register
router.post('/register', async (req, res) => {
  const {name, username, email, password } = req.body;
  const sanitizedInputs = {
    name: normalizeSpaces(name),
    username: removeAllSpaces(username),
    email: removeAllSpaces(email),
    password: removeAllSpaces(password)
  };

  try {
    // Verificiar si el email ya existe
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [sanitizedInputs.email, sanitizedInputs.username]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email o el username ya está en uso' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(sanitizedInputs.password, 10);

    // Insertar usuario
    const [result] = await db.query(
      'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
      [sanitizedInputs.name, sanitizedInputs.username, sanitizedInputs.email, hashedPassword]
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
  const sanitizedInputs = {
    email: removeAllSpaces(email),
    password: removeAllSpaces(password)
  };

  try {
    // Buscar usuario
    const [users] = await db.query(
      'SELECT id, username, password FROM users WHERE email = ?',
      [sanitizedInputs.email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(sanitizedInputs.password, user.password);

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


// GET /auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [userData] = await db.query(
      'SELECT name, username, email, avatar, bio FROM users WHERE id = ?',
      [req.user.id]
    )

    if (userData.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(userData[0]);
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
});

// PUT /auth/profile -- Actualizar el perfil del usuario
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, username, bio, avatar } = req.body;
  const sanitizedInputs = {
    name: normalizeSpaces(name),
    username: removeAllSpaces(username),
    bio: scapeHtml(normalizeSpaces(bio)),
    avatar: removeAllSpaces(avatar)
  };

  try {
    // Verificiar si el username ya existe
    const [existingUsername] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [sanitizedInputs.username]
    );

    if (existingUsername.length > 0) {
      return res.status(400).json({ message: 'El username ya está en uso' });
    }

    const [result] = await db.query(
      'UPDATE users SET name = ?, username = ?, bio = ?, avatar = ? WHERE id = ?',
      [sanitizedInputs.name, sanitizedInputs.username, sanitizedInputs.bio, sanitizedInputs.avatar, req.user.id]
    );
    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;