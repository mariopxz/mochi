const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const linksRoutes = require('./routes/links');
const profileRoutes = require('./routes/profile');
app.use('/auth', authRoutes);
app.use('/links', linksRoutes);
app.use('/', profileRoutes);

const authMiddleware = require('./middleware/auth');
app.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: `Hola ${req.user.username}, estás autenticado` });
});

// Test conexión DB
const db = require('./db/connection');

app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', message: 'Servidor y DB funcionando' });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
})