const axios = require("axios");
const Payment = require("../models/paymentModel");
require("dotenv").config();

// ---------------------- CREATE ORDER -----------------------
const createOrder = async (req, res) => {
  try {
    const { orderAmount, customerName, customerEmail, customerPhone, month, year } = req.body;
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
          return_url: `${process.env.CORS_ORIGIN}/user-profile/payment-success?order_id=${orderId}`,
          notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`, // ✅ must match plural route
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

    await Payment.create({
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

    res.json(response.data);
  } catch (err) {
    console.error("❌ Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment order creation failed" });
  }
};

// ---------------------- PAYMENT SUCCESS (redirect) -----------------------
const paymentSuccess = async (req, res) => {
  try {
    const { order_id } = req.query;

    const verify = await axios.get(`${process.env.CASHFREE_URL}/${order_id}`, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const status = verify.data?.order_status || "UNKNOWN";

    await Payment.findOneAndUpdate(
      { orderId: order_id },
      {
        status: status === "PAID" || status === "SUCCESS" ? "SUCCESS" : status,
        paidAt: new Date(),
      },
      { new: true }
    );

    // redirect back to frontend success page
    res.redirect(`${process.env.CORS_ORIGIN}/user-profile/payment-success?status=${status}&order_id=${order_id}`);
  } catch (err) {
    console.error("❌ Payment success update error:", err);
    res.status(500).json({ error: "Failed to verify payment success" });
  }
};

// ---------------------- PAYMENT FAILURE -----------------------
const paymentFailure = async (req, res) => {
  try {
    const { order_id } = req.query;
    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { status: "FAILED" },
      { new: true }
    );
    res.json({ success: false, order_id });
  } catch (err) {
    console.error("❌ Payment failure update error:", err);
    res.status(500).json({ error: "Failed to update failed payment" });
  }
};

// ---------------------- PAYMENT HISTORY -----------------------
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(
      payments.map((p) => ({
        month: p.month,
        amount: p.orderAmount,
        status: p.status,
        date: p.paidAt || p.createdAt,
      }))
    );
  } catch (err) {
    console.error("❌ History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
};

// ---------------------- CASHFREE WEBHOOK -----------------------
const cashfreeWebhook = async (req, res) => {
  try {
    const event = req.body;
    console.log("🔔 Webhook received:", event?.type);

    if (event?.type === "PAYMENT_SUCCESS") {
      const orderId = event.data.order.order_id;
      await Payment.findOneAndUpdate(
        { orderId },
        { status: "SUCCESS", paidAt: new Date() },
        { new: true }
      );
    } else if (event?.type === "PAYMENT_FAILED") {
      const orderId = event.data.order.order_id;
      await Payment.findOneAndUpdate(
        { orderId },
        { status: "FAILED" },
        { new: true }
      );
    }

    res.status(200).send("Webhook processed");
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
