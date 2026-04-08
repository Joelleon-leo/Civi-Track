const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDb() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(schemaSql);
    console.log('Database schema initialized successfully');
  } catch (err) {
    console.error('Error initializing database schema', err);
  } finally {
    await pool.end();
  }
}

initDb();
