require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const RESERVED = ['health', 'auth', 'links', 'dashboard', 'login', 'register']

// GET /links/u/:username -- Obtener todos los links de un usuario
router.get('/u/:username', async (req, res) => {
  const { username } = req.params;

  if (RESERVED.includes(username)) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  try {
    const [users] = await db.query(
      'SELECT id, name, username, bio, avatar FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = users[0];

    const [links] = await db.query(
      'SELECT * FROM links WHERE user_id = ? ORDER BY position ASC',
      [user.id]
    );
    
    res.json({ user, links });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;