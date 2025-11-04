const axios = require("axios");

const createOrder = async (req, res) => {
  try {
    const { orderId, orderAmount, customerName, customerEmail, customerPhone } = req.body;

    const response = await axios.post(
      process.env.CASHFREE_URL,
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: customerEmail.replace(/[^a-zA-Z0-9_-]/g, ""), // ✅ Fix for Cashfree
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_name: customerName,
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

    res.json(response.data);
  } catch (err) {
    console.error("❌ Cashfree Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment order creation failed" });
  }
};

const paymentSuccess = (req, res) => {
  const { order_id, order_status } = req.query;
  res.json({ success: true, order_id, order_status });
};

const paymentFailure = (req, res) => {
  const { order_id, order_status } = req.query;
  res.json({ success: false, order_id, order_status });
};

module.exports = { createOrder, paymentSuccess, paymentFailure };
