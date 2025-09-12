const {
    getOrdersPerMonth,
    getRevenueOverTime,
    getTopSellingItems,
    getOrderStatusBreakdown,
    getInvoicesByStatus,
  } = require("../models/dashboardModel");
  
  // 1. Orders per Month
  async function ordersPerMonth(_req, res) {
    try {
      const data = await getOrdersPerMonth();
      return res.status(200).json({ ordersPerMonth: data });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch orders per month" });
    }
  }
  
  // 2. Revenue Over Time
  async function revenueOverTime(_req, res) {
    try {
      const data = await getRevenueOverTime();
      return res.status(200).json({ revenueOverTime: data });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch revenue over time" });
    }
  }
  
  // 3. Top-Selling Items
  async function topSellingItems(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5; // allow ?limit=10
      const data = await getTopSellingItems(limit);
      return res.status(200).json({ topSellingItems: data });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch top selling items" });
    }
  }
  
  // 4. Order Status Breakdown
  async function orderStatusBreakdown(_req, res) {
    try {
      const data = await getOrderStatusBreakdown();
      return res.status(200).json({ orderStatusBreakdown: data });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch order status breakdown" });
    }
  }
  
  // 5. Invoices by Status
  async function invoicesByStatus(_req, res) {
    try {
      const data = await getInvoicesByStatus();
      return res.status(200).json({ invoicesByStatus: data });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to fetch invoices by status" });
    }
  }
  
  module.exports = {
    ordersPerMonth,
    revenueOverTime,
    topSellingItems,
    orderStatusBreakdown,
    invoicesByStatus,
  };
  