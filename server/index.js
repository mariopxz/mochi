const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
// Restingir las peticiones al dominio configurado en la variable de entorno
app.use(cors({
  origin: process.env.URL_FRONTEND,
}));
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
  const requiredDbVariables = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missingDbVariables = requiredDbVariables.filter((name) => !process.env[name]);

  if (missingDbVariables.length > 0) {
    return res.status(500).json({
      status: 'error',
      code: 'MISSING_DB_ENV',
      message: `Faltan variables de entorno: ${missingDbVariables.join(', ')}`,
    });
  }

  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', message: 'Servidor y DB funcionando' });
  } catch (error) {
    console.error('Error de conexión con MySQL:', error);
    res.status(500).json({
      status: 'error',
      code: error?.code || null,
      message: error?.sqlMessage || error?.message || String(error),
    });
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
})