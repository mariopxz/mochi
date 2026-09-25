require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { normalizeSpaces, removeAllSpaces, scapeHtml } = require('../utils/sanitize');

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000;

const passwordResetTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

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

// PUT /auth/password -- Actualizar la contraseña del usuario
router.put('/password', authMiddleware, async (req, res) => {
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
router.put('/email', authMiddleware, async (req, res) => {
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
router.post('/forgot-password', async (req, res) => {
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
      from: process.env.SMTP_FROM,
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

    await passwordResetTransporter.sendMail(mailOptions);
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
router.post('/reset-password', async (req, res) => {
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