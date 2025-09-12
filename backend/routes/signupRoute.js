const express = require("express");
const router = express.Router();
const { signup } = require("../controllers/signupController");

// POST /signup
router.post("/signup", signup);

module.exports = router;


