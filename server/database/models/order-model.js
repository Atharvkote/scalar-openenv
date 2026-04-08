const { Schema, model, default: mongoose } = require("mongoose");

// Sub-schema for individual ordered items
const orderProductSchema = new Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  status: {
    type: String,
    enum: ["Not Process", "Processing", "Delivered", "Cancelled"],
    default: "Not Process",
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

// Main Order Schema
const orderSchema = new Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Reference the User model
      required: true,
    },
    tableNo: {
      type: Number,
      required: true,
    },
    products: {
      type: [orderProductSchema],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      set: (v) => Math.round(v * 100) / 100, // Round to 2 decimal places
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Unpaid"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online", "Counter", "Pending", "Razorpay"],
      default: "Cash",
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentOrderId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Not Process", "Processing", "Delivered", "Cancelled"],
      default: "Not Process",
    },
  },
  { timestamps: true }
);

const Order = new mongoose.model("Order", orderSchema);
module.exports = Order;
