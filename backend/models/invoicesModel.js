const pool = require("../config/db");

async function fetchAllInvoices() {
  const query = `
    SELECT i.id, i.order_id, i.customer_id, c.name AS customer_name,
           i.total_amount, i.status, i.issued_at, i.paid_at
    FROM public.invoices i
    LEFT JOIN public.customers c ON c.id = i.customer_id
    ORDER BY i.issued_at DESC, i.id DESC;
  `;
  const { rows } = await pool.query(query);
  return rows.map((r) => ({
    ...r,
    total_amount: Number(r.total_amount),
  }));
}

async function createInvoice({ order_id, customer_id, total_amount, status, issued_at, paid_at }) {
  const fields = ["order_id", "customer_id", "total_amount", "status", "issued_at", "paid_at"];
  const values = [];
  const cols = [];
  const params = [];
  let idx = 1;
  const payload = { order_id, customer_id, total_amount, status, issued_at, paid_at };
  for (const f of fields) {
    if (payload[f] !== undefined && payload[f] !== null) {
      cols.push(f);
      params.push(`$${idx++}`);
      values.push(payload[f]);
    }
  }
  const query = `
    INSERT INTO public.invoices (${cols.join(", ")})
    VALUES (${params.join(", ")})
    RETURNING id, order_id, customer_id, total_amount, status, issued_at, paid_at;
  `;
  const { rows } = await pool.query(query, values);
  const row = rows[0];
  row.total_amount = Number(row.total_amount);
  return row;
}

async function updateInvoiceById(id, fields) {
  const { order_id, customer_id, total_amount, status, issued_at, paid_at } = fields;
  const sets = [];
  const values = [];
  let idx = 1;
  if (order_id !== undefined) { sets.push(`order_id = $${idx++}`); values.push(order_id); }
  if (customer_id !== undefined) { sets.push(`customer_id = $${idx++}`); values.push(customer_id); }
  if (total_amount !== undefined) { sets.push(`total_amount = $${idx++}`); values.push(total_amount); }
  if (status !== undefined) { sets.push(`status = $${idx++}`); values.push(status); }
  if (issued_at !== undefined) { sets.push(`issued_at = $${idx++}`); values.push(issued_at); }
  if (paid_at !== undefined) { sets.push(`paid_at = $${idx++}`); values.push(paid_at); }
  if (sets.length === 0) return null;
  const query = `
    UPDATE public.invoices
    SET ${sets.join(", ")}
    WHERE id = $${idx}
    RETURNING id, order_id, customer_id, total_amount, status, issued_at, paid_at;
  `;
  values.push(id);
  const { rows } = await pool.query(query, values);
  const row = rows[0];
  if (!row) return null;
  row.total_amount = Number(row.total_amount);
  return row;
}

async function deleteInvoiceById(id) {
  const del = `
    DELETE FROM public.invoices
    WHERE id = $1
    RETURNING id;
  `;
  const { rows } = await pool.query(del, [id]);
  return rows.length === 1;
}

module.exports = {
  fetchAllInvoices,
  createInvoice,
  updateInvoiceById,
  deleteInvoiceById,
};


