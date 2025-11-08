const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  orderAmount: Number,
  month: String,
  year: Number,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  status: { type: String, default: "PENDING" },
  createdAt: { type: Date, default: Date.now },
  paidAt: Date,
});

module.exports = mongoose.model("Payment", paymentSchema);
