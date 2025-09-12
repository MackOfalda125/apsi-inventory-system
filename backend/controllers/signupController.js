const { createUser } = require("../models/signupModel");

async function signup(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await createUser(email, password);
    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    if (error.isConflict) {
      return res.status(409).json({ message: "Email already exists" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { signup };


