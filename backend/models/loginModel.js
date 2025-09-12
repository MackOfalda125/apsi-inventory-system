const pool = require("../config/db");

async function verifyUserCredentials(email, plaintextPassword) {
  if (!email || !plaintextPassword) return null;

  const client = await pool.connect();
  try {
    // Check public.users (id as serial/int, password_hash)
    const publicQuery = `
      SELECT id, email, created_at
      FROM public.users
      WHERE email = $1
        AND password_hash = crypt($2, password_hash)
      LIMIT 1;
    `;
    const pubRes = await client.query(publicQuery, [email, plaintextPassword]);
    return pubRes.rows.length === 1 ? pubRes.rows[0] : null;
  } finally {
    client.release();
  }
}

module.exports = {
  verifyUserCredentials,
};


