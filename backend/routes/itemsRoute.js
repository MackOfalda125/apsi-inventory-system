const express = require("express");
const router = express.Router();
const { getItems, addItem, updateItem, deleteItem } = require("../controllers/itemsController");

// GET /items
router.get("/items", getItems);

// POST /items
router.post("/items", addItem);

// PUT /items/:id
router.put("/items/:id", updateItem);

// DELETE /items/:id
router.delete("/items/:id", deleteItem);

module.exports = router;


