require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { normalizeSpaces, removeAllSpaces, scapeHtml } = require('../utils/sanitize');
const { loginLimiter, registerLimiter, forgotPasswordLimiter, resetPasswordLimiter, apiLimiter } = require('../utils/rateLimiters');

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;
const ACCOUNT_DELETION_BATCH_SIZE = 50;

const resend = new Resend(process.env.RESEND_API_KEY);

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const getAccountDeletionStatus = (job) => ({
  status: job.status,
  deletedLinks: Number(job.deleted_links),
  deletedSeparators: Number(job.deleted_separators),
  totalLinks: Number(job.total_links),
  totalSeparators: Number(job.total_separators),
  errorMessage: job.error_message || null,
});

// POST /auth/register
router.post('/register', registerLimiter, async (req, res) => {
  const { name, username, email, password } = req.body;
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
      { id: result.insertId, username: sanitizedInputs.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, username: sanitizedInputs.username });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
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
router.get('/me', apiLimiter, authMiddleware, async (req, res) => {
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
router.put('/profile', apiLimiter, authMiddleware, async (req, res) => {
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
      'SELECT id FROM users WHERE username = ? AND id != ?',
      [sanitizedInputs.username, req.user.id]
    );

    if (existingUsername.length > 0) {
      return res.status(409).json({ message: 'El username ya está en uso' });
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

// POST /auth/delete-account -- Inicia la eliminación gradual de la cuenta
router.post('/delete-account', apiLimiter, authMiddleware, async (req, res) => {
  const { password } = req.body;

  if (typeof password !== 'string' || password.trim().length === 0) {
    return res.status(400).json({ message: 'La contraseña es obligatoria.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [userRows] = await connection.query(
      'SELECT id, password FROM users WHERE id = ? FOR UPDATE',
      [req.user.id]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const validPassword = await bcrypt.compare(password, userRows[0].password);

    if (!validPassword) {
      await connection.rollback();
      return res.status(400).json({ message: 'La contraseña es incorrecta.' });
    }

    const [existingJob] = await connection.query(
      'SELECT status FROM account_deletion_jobs WHERE user_id = ? FOR UPDATE',
      [req.user.id]
    );

    if (existingJob.length > 0 && existingJob[0].status !== 'failed') {
      await connection.rollback();
      return res.status(409).json({ message: 'Ya existe una eliminación de cuenta en curso.' });
    }

    const [linkCount] = await connection.query(
      'SELECT COUNT(*) AS total FROM links WHERE user_id = ?',
      [req.user.id]
    );
    const [separatorCount] = await connection.query(
      'SELECT COUNT(*) AS total FROM separators WHERE user_id = ?',
      [req.user.id]
    );

    await connection.query(
      `INSERT INTO account_deletion_jobs
       (user_id, status, total_links, total_separators)
       VALUES (?, 'processing', ?, ?)
       ON DUPLICATE KEY UPDATE
         status = 'processing',
         error_message = NULL,
         started_at = CURRENT_TIMESTAMP`,
      [req.user.id, linkCount[0].total, separatorCount[0].total]
    );

    const [result] = await connection.query(
      `SELECT status, deleted_links, deleted_separators, total_links, total_separators, error_message
       FROM account_deletion_jobs
       WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    await connection.commit();
    return res.status(202).json({ message: 'Eliminación de cuenta iniciada.', ...getAccountDeletionStatus(result[0]) });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'No se pudo iniciar la eliminación de cuenta.' });
  } finally {
    connection.release();
  }
});

// GET /auth/delete-account -- Consulta el progreso de la eliminación
router.get('/delete-account', apiLimiter, authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT status, deleted_links, deleted_separators, total_links, total_separators, error_message
       FROM account_deletion_jobs
       WHERE user_id = ?`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'No existe una eliminación de cuenta pendiente.' });
    }

    return res.json(getAccountDeletionStatus(result[0]));
  } catch (error) {
    return res.status(500).json({ message: 'No se pudo consultar el progreso de la cuenta.' });
  }
});

// PUT /auth/delete-account -- Elimina un lote pequeño y finaliza la cuenta cuando termina
router.put('/delete-account', apiLimiter, authMiddleware, async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [jobRows] = await connection.query(
      `SELECT status, deleted_links, deleted_separators, total_links, total_separators
       FROM account_deletion_jobs
       WHERE user_id = ? FOR UPDATE`,
      [req.user.id]
    );

    if (jobRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'No existe una eliminación de cuenta pendiente.' });
    }

    const job = jobRows[0];

    if (job.status !== 'processing') {
      await connection.rollback();
      return res.status(409).json({ message: 'La eliminación de cuenta no está activa.' });
    }

    const [links] = await connection.query(
      `SELECT id FROM links
       WHERE user_id = ?
       ORDER BY id ASC
       LIMIT ${ACCOUNT_DELETION_BATCH_SIZE} FOR UPDATE`,
      [req.user.id]
    );
    const [separators] = await connection.query(
      `SELECT id FROM separators
       WHERE user_id = ?
       ORDER BY id ASC
       LIMIT ${ACCOUNT_DELETION_BATCH_SIZE} FOR UPDATE`,
      [req.user.id]
    );

    if (links.length > 0) {
      await connection.query(
        'DELETE FROM links WHERE id IN (?)',
        [links.map((link) => link.id)]
      );
    }

    if (separators.length > 0) {
      await connection.query(
        'DELETE FROM separators WHERE id IN (?)',
        [separators.map((separator) => separator.id)]
      );
    }

    const deletedLinks = Number(job.deleted_links) + links.length;
    const deletedSeparators = Number(job.deleted_separators) + separators.length;
    const remainingLinks = Number(job.total_links) - deletedLinks;
    const remainingSeparators = Number(job.total_separators) - deletedSeparators;

    if (remainingLinks < 0 || remainingSeparators < 0) {
      throw new Error('El progreso de eliminación supera el total de datos.');
    }

    if (remainingLinks === 0 && remainingSeparators === 0) {
      await connection.query('DELETE FROM password_resets WHERE user_id = ?', [req.user.id]);
      await connection.query('DELETE FROM users WHERE id = ?', [req.user.id]);
      await connection.query('DELETE FROM account_deletion_jobs WHERE user_id = ?', [req.user.id]);

      await connection.commit();
      return res.status(200).json({
        status: 'completed',
        deletedLinks,
        deletedSeparators,
        totalLinks: Number(job.total_links),
        totalSeparators: Number(job.total_separators),
        message: 'La cuenta y toda su información se eliminaron correctamente.'
      });
    }

    await connection.query(
      `UPDATE account_deletion_jobs
       SET deleted_links = ?, deleted_separators = ?, status = 'processing'
       WHERE user_id = ?`,
      [deletedLinks, deletedSeparators, req.user.id]
    );

    await connection.commit();
    return res.status(200).json({
      status: 'processing',
      deletedLinks,
      deletedSeparators,
      totalLinks: Number(job.total_links),
      totalSeparators: Number(job.total_separators),
      message: 'Se eliminaron los datos de la cuenta en bloques pequeños.'
    });
  } catch (error) {
    await connection.rollback();

    try {
      await db.query(
        `UPDATE account_deletion_jobs
         SET status = 'failed', error_message = ?
         WHERE user_id = ?`,
        [error.message, req.user.id]
      );
    } catch (jobError) {
      console.error('No se pudo actualizar la tarea de eliminación:', jobError);
    }

    return res.status(500).json({ message: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.' });
  } finally {
    connection.release();
  }
});

// PUT /auth/password -- Actualizar la contraseña del usuario
router.put('/password', apiLimiter, authMiddleware, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const sanitizedInputs = {
    oldPassword: oldPassword.trim(),
    newPassword: newPassword.trim()
  };

  try {
    // Verificar contraseña actual
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    const user = users[0];

    const validPassword = await bcrypt.compare(sanitizedInputs.oldPassword, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
    }

    if (sanitizedInputs.newPassword.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(sanitizedInputs.newPassword, 10);

    // Actualizar contraseña
    const [result] = await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// PUT /auth/email -- Actualizar el email del usuario
router.put('/email', apiLimiter, authMiddleware, async (req, res) => {
  const { newEmail } = req.body;
  const sanitizedInputs = {
    newEmail: removeAllSpaces(newEmail)
  };

  try {
    // Verificar si el email ya existe
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [sanitizedInputs.newEmail]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({ message: 'El email ya está en uso' });
    }

    const [result] = await db.query(
      'UPDATE users SET email = ? WHERE id = ?',
      [sanitizedInputs.newEmail, req.user.id]
    );
    res.json({ message: 'Correo electrónico actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

// POST /auth/forgot-password
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  const { email } = req.body;
  const sanitizedInputs = {
    email: removeAllSpaces(email).toLowerCase()
  };

  try {
    const [existingEmail] = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = ?',
      [sanitizedInputs.email]
    );

    if (existingEmail.length === 0) {
      return res.json({
        message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await db.query('DELETE FROM password_resets WHERE user_id = ?', [existingEmail[0].id]);
    await db.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [existingEmail[0].id, tokenHash, expiresAt]
    );

    const resetUrl = `${process.env.URL_FRONTEND}/reset-password?token=${encodeURIComponent(token)}`;
    const mailOptions = {
      from: process.env.RESEND_FROM,
      to: sanitizedInputs.email,
      subject: "Recupera tu contraseña en Mochi",
      text: `Hola. Recupera tu contraseña desde este enlace: ${resetUrl}. El enlace caduca en 15 minutos.`,
      html: `
        <!doctype html>
        <html lang="es">
          <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
            <div style="display:none;max-height:0;overflow:hidden;">
              Recupera el acceso a tu cuenta de Mochi.
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;">
                    <tr>
                      <td style="background:#4f46e5;padding:28px 32px;text-align:center;">
                        <div style="font-size:26px;font-weight:700;color:#ffffff;">
                          mochi
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding:40px 32px;">
                        <h1 style="margin:0 0 16px;font-size:26px;line-height:1.3;color:#0f172a;">
                          Recupera tu contraseña
                        </h1>

                        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#64748b;">
                          Hemos recibido una solicitud para cambiar la contraseña de tu cuenta.
                          Pulsa el botón para continuar.
                        </p>

                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="border-radius:12px;background:#4f46e5;">
                              <a
                                href="${resetUrl}"
                                style="display:inline-block;padding:14px 24px;border-radius:12px;background:#4f46e5;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;"
                              >
                                Cambiar contraseña
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">
                          Este enlace caduca en 15 minutos y solo puede utilizarse una vez.
                        </p>

                        <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">
                          Si no solicitaste este cambio, puedes ignorar este correo.
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
                        <p style="margin:0;font-size:12px;color:#94a3b8;">
                          © Mochi · Tu espacio en internet
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    await resend.emails.send({
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html,
      text: mailOptions.text,
    })
    console.log('Email enviado correctamente')
    return res.json({
      message: 'Si el correo existe, recibirás instrucciones para recuperar tu contraseña.'
    });
  } catch (error) {
    console.error("Error SMTP/recuperación:", error);

    return res.status(500).json({
      message: "No se pudo iniciar la recuperación de contraseña",
    });
  }
});

// POST /auth/reset-password
router.post('/reset-password', resetPasswordLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  const sanitizedToken = typeof token === 'string' ? token.trim() : '';
  const sanitizedPassword = typeof newPassword === 'string' ? newPassword.trim() : '';

  if (!sanitizedToken || sanitizedPassword.length < 8) {
    return res.status(400).json({
      message: 'El token es obligatorio y la contraseña debe tener al menos 8 caracteres'
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [resetRows] = await connection.query(
      `SELECT id, user_id
       FROM password_resets
        WHERE token = ? AND expires_at > NOW()
       FOR UPDATE`,
      [hashResetToken(sanitizedToken)]
    );

    if (resetRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'El enlace no es válido o ha caducado' });
    }

    const hashedPassword = await bcrypt.hash(sanitizedPassword, 10);

    await connection.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetRows[0].user_id]
    );
    await connection.query('DELETE FROM password_resets WHERE id = ?', [resetRows[0].id]);

    await connection.commit();
    return res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'No se pudo actualizar la contraseña' });
  } finally {
    connection.release();
  }
});

module.exports = router;