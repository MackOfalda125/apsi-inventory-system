const { verifyUserCredentials } = require("../models/loginModel");

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await verifyUserCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // For now, just return a success response with minimal user info (no tokens yet)
    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    // Avoid leaking details; log server-side if logger exists
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { login };


