const pool = require("../config/db");

async function fetchAllCustomers() {
  const query = `
    SELECT id, name, email, phone, address, created_at
    FROM public.customers
    ORDER BY created_at DESC, id DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function createCustomer(name, email, phone, address) {
  const insert = `
    INSERT INTO public.customers (name, email, phone, address)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, phone, address, created_at;
  `;
  const { rows } = await pool.query(insert, [name, email, phone, address]);
  return rows[0];
}

async function updateCustomerById(id, fields) {
  const { name, email, phone, address } = fields;
  // Build dynamic SET clause only for provided fields
  const sets = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { sets.push(`name = $${idx++}`); values.push(name); }
  if (email !== undefined) { sets.push(`email = $${idx++}`); values.push(email); }
  if (phone !== undefined) { sets.push(`phone = $${idx++}`); values.push(phone); }
  if (address !== undefined) { sets.push(`address = $${idx++}`); values.push(address); }

  if (sets.length === 0) {
    return null; // nothing to update
  }

  const query = `
    UPDATE public.customers
    SET ${sets.join(", ")}
    WHERE id = $${idx}
    RETURNING id, name, email, phone, address, created_at;
  `;
  values.push(id);
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

async function deleteCustomerById(id) {
  const del = `
    DELETE FROM public.customers
    WHERE id = $1
    RETURNING id;
  `;
  const { rows } = await pool.query(del, [id]);
  return rows.length === 1;
}

module.exports = {
  fetchAllCustomers,
  createCustomer,
  updateCustomerById,
  deleteCustomerById,
};


