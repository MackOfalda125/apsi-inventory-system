const { fetchAllItems, createItem, updateItemById, deleteItemById } = require("../models/itemsModel");

async function getItems(_req, res) {
  try {
    const items = await fetchAllItems();
    return res.status(200).json({ items });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch items" });
  }
}

async function addItem(req, res) {
  try {
    const { name, category, price, stock, image_url, distributor_id } = req.body || {};
    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }
    const created = await createItem({ name, category, price, stock, image_url, distributor_id });
    return res.status(201).json({ message: "Item created", item: created });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to create item" });
  }
}

async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { name, category, price, stock, image_url, distributor_id } = req.body || {};
    if (!id) {
      return res.status(400).json({ message: "Item id is required" });
    }
    if (
      name === undefined &&
      category === undefined &&
      price === undefined &&
      stock === undefined &&
      image_url === undefined &&
      distributor_id === undefined
    ) {
      return res.status(400).json({ message: "At least one field must be provided" });
    }
    const updated = await updateItemById(id, { name, category, price, stock, image_url, distributor_id });
    if (!updated) {
      return res.status(404).json({ message: "Item not found or no changes" });
    }
    return res.status(200).json({ message: "Item updated", item: updated });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to update item" });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Item id is required" });
    }
    const deleted = await deleteItemById(id);
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.status(200).json({ message: "Item deleted" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete item" });
  }
}

module.exports = {
  getItems,
  addItem,
  updateItem,
  deleteItem,
};


