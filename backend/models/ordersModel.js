const pool = require("../config/db");

async function fetchAllOrders() {
  const query = `
    SELECT 
      o.id,
      o.customer_id,
      c.name AS customer_name,
      o.order_date,
      o.status,
      COALESCE(SUM(ol.quantity * ol.price_at_order), 0) AS total_amount
    FROM public.orders o
    LEFT JOIN public.customers c ON c.id = o.customer_id
    LEFT JOIN public.orderlines ol ON ol.order_id = o.id
    GROUP BY o.id, o.customer_id, c.name, o.order_date, o.status
    ORDER BY o.order_date DESC, o.id DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function createOrderWithLines(customerId, items, status) {
  // items: [{ item_id, quantity }]
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert order header
    let orderRes;
    if (status) {
      const insertWithStatus = `
        INSERT INTO public.orders (customer_id, status)
        VALUES ($1, $2)
        RETURNING id, customer_id, order_date, status;
      `;
      orderRes = await client.query(insertWithStatus, [customerId, status]);
    } else {
      const insertOrder = `
        INSERT INTO public.orders (customer_id)
        VALUES ($1)
        RETURNING id, customer_id, order_date, status;
      `;
      orderRes = await client.query(insertOrder, [customerId]);
    }
    const order = orderRes.rows[0];

    // Fetch prices for all item_ids
    const itemIds = items.map((it) => it.item_id);
    const pricesRes = await client.query(
      `SELECT id, price FROM public.items WHERE id = ANY($1::int[])`,
      [itemIds]
    );
    const idToPrice = new Map(pricesRes.rows.map((r) => [r.id, Number(r.price)]));

    // Validate all items exist
    for (const it of items) {
      if (!idToPrice.has(it.item_id)) {
        const err = new Error(`Item not found: ${it.item_id}`);
        err.code = 'ITEM_NOT_FOUND';
        throw err;
      }
    }

    // Insert order lines
    const insertLine = `
      INSERT INTO public.orderlines (order_id, item_id, quantity, price_at_order)
      VALUES ($1, $2, $3, $4)
      RETURNING id, order_id, item_id, quantity, price_at_order;
    `;
    const lines = [];
    let totalAmount = 0;
    for (const it of items) {
      const unitPrice = idToPrice.get(it.item_id);
      const lineRes = await client.query(insertLine, [order.id, it.item_id, it.quantity, unitPrice]);
      const line = lineRes.rows[0];
      // Cast numeric to Number for response consistency
      line.price_at_order = Number(line.price_at_order);
      lines.push(line);
      totalAmount += unitPrice * it.quantity;
    }

    await client.query('COMMIT');

    return {
      order,
      lines,
      total_amount: totalAmount,
    };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
}


async function fetchOrderWithLines(orderId) {
  const headerQuery = `
    SELECT o.id, o.customer_id, c.name AS customer_name, o.order_date, o.status
    FROM public.orders o
    LEFT JOIN public.customers c ON c.id = o.customer_id
    WHERE o.id = $1
    LIMIT 1;
  `;
  const linesQuery = `
    SELECT ol.id, ol.item_id, i.name AS item_name, ol.quantity, ol.price_at_order
    FROM public.orderlines ol
    LEFT JOIN public.items i ON i.id = ol.item_id
    WHERE ol.order_id = $1
    ORDER BY ol.id ASC;
  `;
  const [orderRes, linesRes] = await Promise.all([
    pool.query(headerQuery, [orderId]),
    pool.query(linesQuery, [orderId]),
  ]);
  if (orderRes.rows.length === 0) return null;
  const order = orderRes.rows[0];
  const lines = linesRes.rows.map((l) => ({
    id: l.id,
    item_id: l.item_id,
    item_name: l.item_name,
    quantity: l.quantity,
    price_at_order: Number(l.price_at_order),
  }));
  const total_amount = lines.reduce((sum, l) => sum + l.price_at_order * l.quantity, 0);
  return { order, lines, total_amount };
}

async function updateOrderWithLines(orderId, { customer_id, status, items }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure order exists
    const exists = await client.query(`SELECT id FROM public.orders WHERE id = $1`, [orderId]);
    if (exists.rows.length === 0) {
      const err = new Error('Order not found');
      err.code = 'ORDER_NOT_FOUND';
      throw err;
    }

    // Update order header fields if provided
    const sets = [];
    const values = [];
    let idx = 1;
    if (customer_id !== undefined) { sets.push(`customer_id = $${idx++}`); values.push(customer_id); }
    if (status !== undefined) { sets.push(`status = $${idx++}`); values.push(status); }
    if (sets.length > 0) {
      values.push(orderId);
      await client.query(`UPDATE public.orders SET ${sets.join(', ')} WHERE id = $${idx}`, values);
    }

    // If items provided, replace lines
    let lines = [];
    let totalAmount = 0;
    if (Array.isArray(items)) {
      await client.query(`DELETE FROM public.orderlines WHERE order_id = $1`, [orderId]);

      if (items.length > 0) {
        const itemIds = items.map((it) => it.item_id);
        const pricesRes = await client.query(
          `SELECT id, price FROM public.items WHERE id = ANY($1::int[])`,
          [itemIds]
        );
        const idToPrice = new Map(pricesRes.rows.map((r) => [r.id, Number(r.price)]));
        for (const it of items) {
          if (!idToPrice.has(it.item_id)) {
            const err = new Error(`Item not found: ${it.item_id}`);
            err.code = 'ITEM_NOT_FOUND';
            throw err;
          }
        }

        const insertLine = `
          INSERT INTO public.orderlines (order_id, item_id, quantity, price_at_order)
          VALUES ($1, $2, $3, $4)
          RETURNING id, order_id, item_id, quantity, price_at_order;
        `;
        for (const it of items) {
          const unitPrice = idToPrice.get(it.item_id);
          const lineRes = await client.query(insertLine, [orderId, it.item_id, it.quantity, unitPrice]);
          const line = lineRes.rows[0];
          line.price_at_order = Number(line.price_at_order);
          lines.push(line);
          totalAmount += unitPrice * it.quantity;
        }
      }
    } else {
      // If items not provided, fetch current lines to compute total
      const curr = await pool.query(`SELECT quantity, price_at_order FROM public.orderlines WHERE order_id = $1`, [orderId]);
      totalAmount = curr.rows.reduce((s, r) => s + Number(r.price_at_order) * r.quantity, 0);
      const currLines = await pool.query(`
        SELECT id, item_id, quantity, price_at_order FROM public.orderlines WHERE order_id = $1 ORDER BY id ASC
      `, [orderId]);
      lines = currLines.rows.map((r) => ({
        id: r.id,
        item_id: r.item_id,
        quantity: r.quantity,
        price_at_order: Number(r.price_at_order),
      }));
    }

    await client.query('COMMIT');

    // Return updated header
    const header = await pool.query(`
      SELECT o.id, o.customer_id, c.name AS customer_name, o.order_date, o.status
      FROM public.orders o
      LEFT JOIN public.customers c ON c.id = o.customer_id
      WHERE o.id = $1
    `, [orderId]);
    const order = header.rows[0];
    return { order, lines, total_amount: totalAmount };
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  fetchAllOrders,
  createOrderWithLines,
  fetchOrderWithLines,
  updateOrderWithLines,
  deleteOrderById,
};

async function deleteOrderById(orderId) {
  const del = `
    DELETE FROM public.orders
    WHERE id = $1
    RETURNING id;
  `;
  const { rows } = await pool.query(del, [orderId]);
  return rows.length === 1;
}



