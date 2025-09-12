require("dotenv").config();
const express = require("express");
const cors = require("cors");

const loginRouter = require("./routes/loginRoute");
const signupRouter = require("./routes/signupRoute");
const customersRouter = require("./routes/customersRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", loginRouter);
app.use("/api", signupRouter);
app.use("/api", customersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on port ${PORT}`);
});

module.exports = app;


