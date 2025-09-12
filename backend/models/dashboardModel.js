const pool = require("../config/db");

// 1. Orders per Month
async function getOrdersPerMonth() {
  const query = `
    SELECT 
      DATE_TRUNC('month', order_date) AS month,
      COUNT(*) AS total_orders
    FROM public.orders
    GROUP BY month
    ORDER BY month;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

// 2. Revenue Over Time
async function getRevenueOverTime() {
  const query = `
    SELECT 
      DATE_TRUNC('month', issued_at) AS month,
      SUM(total_amount) AS total_revenue
    FROM public.invoices
    GROUP BY month
    ORDER BY month;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

// 3. Top-Selling Items
async function getTopSellingItems(limit = 5) {
  const query = `
    SELECT 
      i.name,
      SUM(ol.quantity) AS total_sold
    FROM public.orderlines ol
    JOIN public.items i ON ol.item_id = i.id
    GROUP BY i.name
    ORDER BY total_sold DESC
    LIMIT $1;
  `;
  const { rows } = await pool.query(query, [limit]);
  return rows;
}

// 4. Order Status Breakdown
async function getOrderStatusBreakdown() {
  const query = `
    SELECT 
      status,
      COUNT(*) AS count
    FROM public.orders
    GROUP BY status;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

// 5. Invoices by Status
async function getInvoicesByStatus() {
  const query = `
    SELECT 
      status,
      COUNT(*) AS count
    FROM public.invoices
    GROUP BY status;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  getOrdersPerMonth,
  getRevenueOverTime,
  getTopSellingItems,
  getOrderStatusBreakdown,
  getInvoicesByStatus,
};
