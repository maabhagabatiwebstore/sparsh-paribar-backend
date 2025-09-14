const express = require("express");
const { createOrder ,paymentSuccess, paymentFailure } = require("../controllers/paymentController");
const router = express.Router();

router.post("/create-order", createOrder);
router.get("/payment-success", paymentSuccess);
router.get("/payment-failed", paymentFailure);

module.exports = router;
