const express = require("express");
const router = express.Router();
const {
  ordersPerMonth,
  revenueOverTime,
  topSellingItems,
  orderStatusBreakdown,
  invoicesByStatus,
} = require("../controllers/dashboardController");

// GET /dashboard/orders-per-month
router.get("/dashboard/orders", ordersPerMonth);

// GET /dashboard/revenue-over-time
router.get("/dashboard/revenue", revenueOverTime);

// GET /dashboard/top-selling-items
router.get("/dashboard/top", topSellingItems);

// GET /dashboard/order-status-breakdown
router.get("/dashboard/order", orderStatusBreakdown);

// GET /dashboard/invoices-by-status
router.get("/dashboard/invoices", invoicesByStatus);

module.exports = router;
