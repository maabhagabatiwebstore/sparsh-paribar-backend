const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  dateOfJoin: { type: Date, default: Date.now },
  image: { type: String }, // image URL
});

module.exports = mongoose.model("User", memberSchema);
