const { fetchAllInvoices, createInvoice, updateInvoiceById, deleteInvoiceById } = require("../models/invoicesModel");

async function getInvoices(_req, res) {
  try {
    const invoices = await fetchAllInvoices();
    return res.status(200).json({ invoices });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch invoices" });
  }
}

async function addInvoice(req, res) {
  try {
    const { order_id, customer_id, total_amount, status, issued_at, paid_at } = req.body || {};
    if (!order_id || !customer_id || total_amount === undefined) {
      return res.status(400).json({ message: "order_id, customer_id and total_amount are required" });
    }
    const created = await createInvoice({ order_id, customer_id, total_amount, status, issued_at, paid_at });
    return res.status(201).json({ message: "Invoice created", invoice: created });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to create invoice" });
  }
}

async function updateInvoice(req, res) {
  try {
    const { id } = req.params;
    const { order_id, customer_id, total_amount, status, issued_at, paid_at } = req.body || {};
    if (
      order_id === undefined &&
      customer_id === undefined &&
      total_amount === undefined &&
      status === undefined &&
      issued_at === undefined &&
      paid_at === undefined
    ) {
      return res.status(400).json({ message: "At least one field must be provided" });
    }
    const updated = await updateInvoiceById(id, { order_id, customer_id, total_amount, status, issued_at, paid_at });
    if (!updated) return res.status(404).json({ message: "Invoice not found or no changes" });
    return res.status(200).json({ message: "Invoice updated", invoice: updated });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to update invoice" });
  }
}

async function deleteInvoice(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteInvoiceById(id);
    if (!deleted) return res.status(404).json({ message: "Invoice not found" });
    return res.status(200).json({ message: "Invoice deleted" });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to delete invoice" });
  }
}

module.exports = {
  getInvoices,
  addInvoice,
  updateInvoice,
  deleteInvoice,
};


