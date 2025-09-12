const express = require("express");
const router = express.Router();
const { getCustomers, addCustomer, updateCustomer, deleteCustomer } = require("../controllers/customersController");

// GET /customers
router.get("/customers", getCustomers);

// POST /customers
router.post("/customers", addCustomer);

// PUT /customers/:id
router.put("/customers/:id", updateCustomer);

// DELETE /customers/:id
router.delete("/customers/:id", deleteCustomer);

module.exports = router;


