require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');

// GET /links -- Obtener todos los links y separadores del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [links] = await db.query(
      'SELECT *, "link" AS type FROM links WHERE user_id = ? ORDER BY position ASC',
      [req.user.id]
    );
    const [separators] = await db.query(
      'SELECT id, name, position, created_at, "separator" AS type FROM separators WHERE user_id = ? ORDER BY position ASC',
      [req.user.id]
    );
    const items = [...links, ...separators]
      .sort((first, second) => first.position - second.position)
      .map((item, position) => ({ ...item, position }));

    res.json(items);
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
    const [lastSeparatorPosition] = await db.query(
      'SELECT MAX(position) AS maxPos FROM separators WHERE user_id = ?',
      [req.user.id]
    );
    const position = Math.max(
      lastPosition[0].maxPos ?? -1,
      lastSeparatorPosition[0].maxPos ?? -1
    ) + 1;

    const [result] = await db.query(
      'INSERT INTO links (user_id, title, url, position) VALUES (?, ?, ?, ?)',
      [req.user.id, title, url, position]
    )

    res.status(201).json({ id: result.insertId, type: 'link', title, url, position });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// PUT /links/reorder -- Reordenar links y separadores
router.put('/reorder', authMiddleware, async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'La lista de elementos es obligatoria.' });
  }

  const transaction = await db.getConnection();

  try {
    await transaction.beginTransaction();

    for (const item of items) {
      if (item.type === 'separator') {
        await transaction.query(
          'UPDATE separators SET position = ? WHERE id = ? AND user_id = ?',
          [item.position, item.id, req.user.id]
        );
      } else {
        await transaction.query(
          'UPDATE links SET position = ? WHERE id = ? AND user_id = ?',
          [item.position, item.id, req.user.id]
        );
      }
    }

    await transaction.commit();
    res.status(200).json({ message: 'Orden actualizado' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  } finally {
    transaction.release();
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
