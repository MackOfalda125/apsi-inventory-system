const express = require("express");
const router = express.Router();
const { getOrders, addOrder, getOrder, updateOrder, deleteOrder } = require("../controllers/ordersController");

// GET /orders
router.get("/orders", getOrders);

// POST /orders
router.post("/orders", addOrder);

// GET /orders/:id
router.get("/orders/:id", getOrder);

// PUT /orders/:id
router.put("/orders/:id", updateOrder);

// DELETE /orders/:id
router.delete("/orders/:id", deleteOrder);

module.exports = router;


