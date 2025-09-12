require("dotenv").config();
const { Pool } = require("pg");

// const pool = new Pool({
//   host: process.env.PG_HOST,
//   port: process.env.PG_PORT,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DATABASE,
//   ssl: { rejectUnauthorized: false }, // Needed for Supabase
// });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // still needed for Supabase
});

module.exports = pool;

