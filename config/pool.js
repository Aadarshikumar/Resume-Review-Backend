const { Pool } = require('pg');
require('dotenv').config(); // Ensure dotenv is imported properly

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: 5432, // Default PostgreSQL port
});

module.exports = pool;
