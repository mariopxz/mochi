require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');

// POST /separators -- Crear separador nuevo
router.post('/', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const cleanName = typeof name === 'string' ? name.trim() : '';

  if (!cleanName || cleanName.length > 80) {
    return res.status(400).json({ message: 'El nombre del separador es obligatorio y debe tener menos de 81 caracteres.' });
  }

  try {
    const [linksPosition] = await db.query(
      'SELECT MAX(position) AS maxPos FROM links WHERE user_id = ?',
      [req.user.id]
    );
    const [separatorsPosition] = await db.query(
      'SELECT MAX(position) AS maxPos FROM separators WHERE user_id = ?',
      [req.user.id]
    );
    const position = Math.max(
      linksPosition[0].maxPos ?? -1,
      separatorsPosition[0].maxPos ?? -1
    ) + 1;
    const [result] = await db.query(
      'INSERT INTO separators (user_id, name, position) VALUES (?, ?, ?)',
      [req.user.id, cleanName, position]
    );

    res.status(201).json({ id: result.insertId, type: 'separator', name: cleanName, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /separators/:id -- Actualizar separador
router.put('/:id', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const cleanName = typeof name === 'string' ? name.trim() : '';

  if (!cleanName || cleanName.length > 80) {
    return res.status(400).json({ message: 'El nombre del separador es obligatorio y debe tener menos de 81 caracteres.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE separators SET name = ? WHERE id = ? AND user_id = ?',
      [cleanName, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Separador no encontrado' });
    }

    res.status(200).json({ id: Number(req.params.id), type: 'separator', name: cleanName });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /separators/:id -- Eliminar separador
router.delete('/:id', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: 'El identificador del separador es inválido.' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM separators WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Separador no encontrado' });
    }

    res.status(200).json({ message: 'Separador eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
