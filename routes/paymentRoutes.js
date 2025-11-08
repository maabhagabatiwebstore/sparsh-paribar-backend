const express = require("express");
const { createOrder ,paymentSuccess, paymentFailure ,getPaymentHistory,
  cashfreeWebhook,} = require("../controllers/paymentController");
const router = express.Router();

router.post("/create-order", createOrder);
router.get("/payment-success", paymentSuccess);
router.get("/payment-failed", paymentFailure);
router.get("/history", getPaymentHistory);
router.post("/webhook", cashfreeWebhook);

module.exports = router;
