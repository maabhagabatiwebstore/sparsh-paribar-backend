const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const userRoutes = require("./routes/authRoutes");

const app = express();

const frontendUrl = process.env.CORS_ORIGIN || '*';

// Configure CORS
app.use(cors({
  origin: frontendUrl,           // allow only your frontend
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true              // if using cookies or auth headers
}));
app.use(express.json());
//app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));

// DB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB error:", err));

// Routes
app.use("/api/users", userRoutes);

// Health check
app.get("/healthz", (_, res) => res.send("ok"));

// Start
const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => console.log(`Server running on ${port}`));
