const axios = require("axios");
const Payment = require("../models/paymentModel"); // ✅ Mongoose model
require("dotenv").config();

// ---------------------- CREATE ORDER -----------------------
const createOrder = async (req, res) => {
  try {
    const { orderAmount, customerName, customerEmail, customerPhone, month, year } = req.body;

    // ✅ Generate unique orderId automatically
    const orderId = `ORD-${Date.now()}-${month}`;

    const response = await axios.post(
      process.env.CASHFREE_URL,
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9_-]/g, ""),
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_name: customerName,
        },
        order_meta: {
          return_url: `https://sparshparibar.netlify.app/user-profile/payment-success?order_id=${orderId}`,
          notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`, // ✅ Webhook to auto update DB
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    // Save order in DB as "Pending"
    const newPayment = new Payment({
      orderId,
      orderAmount,
      month,
      year,
      customerName,
      customerEmail,
      customerPhone,
      status: "PENDING",
      createdAt: new Date(),
    });
    await newPayment.save();

    res.json(response.data);
  } catch (err) {
    console.error("❌ Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment order creation failed" });
  }
};

// ---------------------- PAYMENT SUCCESS (REDIRECT) -----------------------
const paymentSuccess = async (req, res) => {
  try {
    const { order_id, order_status } = req.query;

    // ✅ Update status in DB
    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: order_status, paidAt: new Date() },
      { new: true }
    );

    res.json({ success: true, order_id, order_status });
  } catch (err) {
    console.error("❌ Payment success update error:", err);
    res.status(500).json({ error: "Failed to update success payment" });
  }
};

// ---------------------- PAYMENT FAILURE (REDIRECT) -----------------------
const paymentFailure = async (req, res) => {
  try {
    const { order_id, order_status } = req.query;
    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: order_status },
      { new: true }
    );

    res.json({ success: false, order_id, order_status });
  } catch (err) {
    console.error("❌ Payment failure update error:", err);
    res.status(500).json({ error: "Failed to update failed payment" });
  }
};

// ---------------------- GET HISTORY (for frontend table) -----------------------
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ status: "SUCCESS" }).sort({ paidAt: -1 });
    res.json(
      payments.map((p) => ({
        name: p.month,
        amount: p.orderAmount,
        date: p.paidAt,
        status: p.status,
      }))
    );
  } catch (err) {
    console.error("❌ History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// ---------------------- OPTIONAL WEBHOOK (Cashfree auto confirmation) -----------------------
const cashfreeWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (event.type === "PAYMENT_SUCCESS") {
      const orderId = event.data.order.order_id;
      await Payment.findOneAndUpdate(
        { orderId },
        { status: "SUCCESS", paidAt: new Date() }
      );
    }

    res.status(200).send("Webhook received");
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.status(500).send("Error processing webhook");
  }
};

module.exports = {
  createOrder,
  paymentSuccess,
  paymentFailure,
  getPaymentHistory,
  cashfreeWebhook,
};
