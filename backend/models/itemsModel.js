const pool = require("../config/db");

async function fetchAllItems() {
  const query = `
    SELECT id, name, category, price, stock, image_url, distributor_id
    FROM public.items
    ORDER BY id DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function createItem({ name, category, price, stock = 0, image_url, distributor_id }) {
  const insert = `
    INSERT INTO public.items (name, category, price, stock, image_url, distributor_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, category, price, stock, image_url, distributor_id;
  `;
  const params = [name, category ?? null, price, stock ?? 0, image_url ?? null, distributor_id ?? null];
  const { rows } = await pool.query(insert, params);
  return rows[0];
}

async function updateItemById(id, fields) {
  const { name, category, price, stock, image_url, distributor_id } = fields;
  const sets = [];
  const values = [];
  let idx = 1;
  if (name !== undefined) { sets.push(`name = $${idx++}`); values.push(name); }
  if (category !== undefined) { sets.push(`category = $${idx++}`); values.push(category); }
  if (price !== undefined) { sets.push(`price = $${idx++}`); values.push(price); }
  if (stock !== undefined) { sets.push(`stock = $${idx++}`); values.push(stock); }
  if (image_url !== undefined) { sets.push(`image_url = $${idx++}`); values.push(image_url); }
  if (distributor_id !== undefined) { sets.push(`distributor_id = $${idx++}`); values.push(distributor_id); }

  if (sets.length === 0) return null;

  const query = `
    UPDATE public.items
    SET ${sets.join(", ")}
    WHERE id = $${idx}
    RETURNING id, name, category, price, stock, image_url, distributor_id;
  `;
  values.push(id);
  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

async function deleteItemById(id) {
  const del = `
    DELETE FROM public.items
    WHERE id = $1
    RETURNING id;
  `;
  const { rows } = await pool.query(del, [id]);
  return rows.length === 1;
}

module.exports = {
  fetchAllItems,
  createItem,
  updateItemById,
  deleteItemById,
};


