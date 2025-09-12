const pool = require("../config/db");

/**
 * Create a new user in public.users, hashing the password using pgcrypto.
 * Returns the created user's id, email, created_at.
 */
async function createUser(email, plaintextPassword) {
  const client = await pool.connect();
  try {
    const insertQuery = `
      INSERT INTO public.users (email, password_hash)
      VALUES ($1, crypt($2, gen_salt('bf')))
      RETURNING id, email, created_at;
    `;
    const result = await client.query(insertQuery, [email, plaintextPassword]);
    return result.rows[0];
  } catch (error) {
    // Unique violation (duplicate email)
    if (error && error.code === '23505') {
      error.isConflict = true;
    }
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  createUser,
};


