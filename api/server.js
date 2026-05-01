const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  // on indique si Mongo est connecté
  const mongoState = mongoose.connection.readyState; // 0 disconnected, 1 connected...
  res.json({
    status: "ok",
    message: "API fonctionnelle",
    mongo: mongoState === 1 ? "connected" : "not_connected",
  });
});

const PORT = process.env.PORT || 5000;

async function start() {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    console.error("Missing MONGO_URL in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`API listening on port ${PORT}`);
  });
}

start();