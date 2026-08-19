const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function connectPostgres() {
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected → student_vault');
}

module.exports = { pool, connectPostgres };
