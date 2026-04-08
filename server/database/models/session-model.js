const { Schema, model, default: mongoose } = require("mongoose");

const sessionSchema = new Schema(
  {
    tableNo: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,

    mergedFrom: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    paymentMethod: {
      type: String,
      enum: ["Cash", "Online", "Razorpay", ""],
      default: "",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid"],
      default: "Unpaid",
    },
    paymentId: {
      type: String,
      default: "",
    },
    paymentOrderId: {
      type: String,
      default: "",
    },
    finalAmount: {
      type: Number,
      default: 0,
      set: (v) => Math.round(v * 100) / 100, // Round to 2 decimal places
    },
  },
  { timestamps: true }
);

const Session = new mongoose.model("Session", sessionSchema);
module.exports = Session;
