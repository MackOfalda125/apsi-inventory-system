const { fetchAllOrders, createOrderWithLines, fetchOrderWithLines, updateOrderWithLines, deleteOrderById } = require("../models/ordersModel");

async function getOrders(_req, res) {
  try {
    const orders = await fetchAllOrders();
    return res.status(200).json({ orders });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}

async function addOrder(req, res) {
  try {
    const { customer_id, items, status } = req.body || {};
    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "customer_id and non-empty items array are required" });
    }

    // Basic validation of each item
    for (const it of items) {
      if (!it || typeof it.item_id !== 'number' || typeof it.quantity !== 'number' || it.quantity <= 0) {
        return res.status(400).json({ message: "Each item must include numeric item_id and positive quantity" });
      }
    }

    // Optional status: must be a non-empty string if provided
    if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
      return res.status(400).json({ message: "status must be a non-empty string if provided" });
    }

    const result = await createOrderWithLines(customer_id, items, status);
    return res.status(201).json({
      message: "Order created",
      order: result.order,
      lines: result.lines,
      total_amount: result.total_amount,
    });
  } catch (error) {
    if (error && error.code === 'ITEM_NOT_FOUND') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create order" });
  }
}

async function getOrder(req, res) {
  try {
    const { id } = req.params;
    const result = await fetchOrderWithLines(id);
    if (!result) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json(result);
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch order" });
  }
}

async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { customer_id, status, items } = req.body || {};

    if (status !== undefined && (typeof status !== 'string' || status.trim() === '')) {
      return res.status(400).json({ message: "status must be a non-empty string if provided" });
    }
    if (items !== undefined) {
      if (!Array.isArray(items)) return res.status(400).json({ message: "items must be an array if provided" });
      for (const it of items) {
        if (!it || typeof it.item_id !== 'number' || typeof it.quantity !== 'number' || it.quantity <= 0) {
          return res.status(400).json({ message: "Each item must include numeric item_id and positive quantity" });
        }
      }
    }

    const result = await updateOrderWithLines(id, { customer_id, status, items });
    return res.status(200).json(result);
  } catch (error) {
    if (error && error.code === 'ORDER_NOT_FOUND') {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (error && error.code === 'ITEM_NOT_FOUND') {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to update order" });
  }
}

async function deleteOrder(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteOrderById(id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    return res.status(200).json({ message: 'Order deleted' });
  } catch (_error) {
    return res.status(500).json({ message: 'Failed to delete order' });
  }
}

module.exports = {
  getOrders,
  addOrder,
  getOrder,
  updateOrder,
  deleteOrder,
};


