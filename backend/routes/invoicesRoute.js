const express = require("express");
const router = express.Router();
const { getInvoices, addInvoice, updateInvoice, deleteInvoice } = require("../controllers/invoicesController");

// GET /invoices
router.get("/invoices", getInvoices);

// POST /invoices
router.post("/invoices", addInvoice);

// PUT /invoices/:id
router.put("/invoices/:id", updateInvoice);

// DELETE /invoices/:id
router.delete("/invoices/:id", deleteInvoice);

module.exports = router;


