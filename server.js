const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require("./routes/paymentRoutes");



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


// DB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB error:", err));

// Routes

app.use("/api/auth", authRoutes);//local
app.use('/api/users', userRoutes);
app.use("/api/payment", paymentRoutes);

// Health check
app.get("/healthz", (_, res) => res.send("ok"));

// Start
const port = process.env.PORT || 4000;
app.listen(port, "0.0.0.0", () => console.log(`Server running on ${port}`));
