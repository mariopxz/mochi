require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');

// GET /links -- Obtener todos los links del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [links] = await db.query(
      'SELECT * FROM links WHERE user_id = ?',
      [req.user.id]
    );
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// POST /links -- Crear link nuevo
router.post('/', authMiddleware, async (req, res) => {
  const { title, url } = req.body;

  try {
    // Verificar si el link ya existe
    const [existing] = await db.query(
      'SELECT id FROM links WHERE url = ? AND user_id = ?',
      [url, req.user.id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ya tienes un link con esa URL' });
    }

    // Obtener la última posición
    const [lastPosition] = await db.query(
      'SELECT MAX(position) AS maxPos FROM links WHERE user_id = ?',
      [req.user.id]
    );
    const position = (lastPosition[0].maxPos ?? -1) + 1;

    const [result] = await db.query(
      'INSERT INTO links (user_id, title, url, position) VALUES (?, ?, ?, ?)',
      [req.user.id, title, url, position]
    )

    res.status(201).json({ id: result.insertId, title, url, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// PUT /links/reorder -- Reordenar links
router.put('/reorder', authMiddleware, async (req, res) => {
  const { links } = req.body; // array de { id, position }

  try {
    for (const link of links) {
      await db.query(
        'UPDATE links SET position = ? WHERE id = ? AND user_id = ?',
        [link.position, link.id, req.user.id]
      )
    }
    res.status(200).json({ message: 'Orden actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// PUT /links/:id -- Actualizar link
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, url } = req.body;
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE links SET title = ?, url = ? WHERE id = ? AND user_id = ?',
      [title, url, id, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Link no encontrado' })
    }

    res.status(200).json({ id, title, url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// DELETE /links/:id -- Eliminar link
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'DELETE FROM links WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Link no encontrado' })
    }

    res.status(200).json({ message: 'Link eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// POST /links/:id/click -- Incrementar el click de un link
router.post('/:id/click', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      'UPDATE links SET clicks = clicks + 1 WHERE id = ?',
      [id]
    )
    res.status(200).json({ message: 'Click incrementado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;