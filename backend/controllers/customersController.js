const { fetchAllCustomers, createCustomer, updateCustomerById, deleteCustomerById } = require("../models/customersModel");

async function getCustomers(_req, res) {
  try {
    const customers = await fetchAllCustomers();
    return res.status(200).json({ customers });
  } catch (_error) {
    return res.status(500).json({ message: "Failed to fetch customers" });
  }
}

module.exports = {
  getCustomers,
  async addCustomer(req, res) {
    try {
      const { name, email, phone, address } = req.body || {};

      if (!name || !email || !phone || !address) {
        return res.status(400).json({ message: "name, email, phone, and address are required" });
      }

      const created = await createCustomer(name, email, phone, address);
      return res.status(201).json({
        message: "Customer created",
        customer: created,
      });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to create customer" });
    }
  },
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, address } = req.body || {};

      if (!id) {
        return res.status(400).json({ message: "Customer id is required" });
      }

      if (name === undefined && email === undefined && phone === undefined && address === undefined) {
        return res.status(400).json({ message: "At least one field (name, email, phone, address) must be provided" });
      }

      const updated = await updateCustomerById(id, { name, email, phone, address });
      if (!updated) {
        return res.status(404).json({ message: "Customer not found or no changes" });
      }

      return res.status(200).json({
        message: "Customer updated",
        customer: updated,
      });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to update customer" });
    }
  },
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "Customer id is required" });
      }
      const deleted = await deleteCustomerById(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      return res.status(200).json({ message: "Customer deleted" });
    } catch (_error) {
      return res.status(500).json({ message: "Failed to delete customer" });
    }
  },
};


