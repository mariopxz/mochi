const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_CA ? { ca: process.env.DB_CA } : undefined, // SSL opcional para Aiven
  timezone: 'Z' // Fechas en UTC, igual que Aiven, aunque el servidor corra en otra zona horaria
});

module.exports = pool.promise();