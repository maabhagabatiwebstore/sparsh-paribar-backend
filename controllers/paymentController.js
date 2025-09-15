import axios from "axios";

export const createOrder = async (req, res) => {
  try {
    const { orderId, orderAmount, customerName, customerEmail, customerPhone } = req.body;

    const response = await axios.post(
      process.env.CASHFREE_URL,
      {
        order_id: orderId,
        order_amount: orderAmount,
        order_currency: "INR",
        customer_details: {
          customer_id: `cust_${Date.now()}`,  // ✅ safe alphanumeric ID
          customer_email: customerEmail,      // ✅ keep email here
          customer_phone: customerPhone,
          customer_name: customerName,
        },
        order_note: "Test Payment from Sparsh Paribar",
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
    res.status(500).json({
      error: "Payment order creation failed",
      details: err.response?.data || err.message,
    });
  }
};

export const paymentSuccess = (req, res) => {
  const { order_id, order_status } = req.query;
  res.json({ success: true, order_id, order_status });
};

export const paymentFailure = (req, res) => {
  const { order_id, order_status } = req.query;
  res.json({ success: false, order_id, order_status });
};
