require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../database/models/user-model");
const Order = require("../database/models/order-model");
const Table = require("../database/models/table-model");
const Session = require("../database/models/session-model");
const logger = require("../utils/logger");
const Razorpay = require("razorpay");
const axios = require("axios");
const crypto = require("crypto");
const { emitTableStatusUpdate } = require('./admin-controller'); // Import at top

// Instance OF razorPay
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Generate Bill
const generateBill = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    // Verify is Mongobject
    if (!sessionId) {
      return res.status(400).json({ message: "field is required" });
    }
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid Session" });
    }
    // Find Session
    const session = await Session.findById(sessionId);

    const orders = await Order.find({
      sessionId: sessionId,
      paymentStatus: "Unpaid",
    });

    if (!orders.length) {
      return res
        .status(404)
        .json({ message: "No unpaid orders found for this session." });
    }

    const total = orders.reduce((acc, order) => acc + order.amount, 0);
    // in Session Final Amount is Set
    session.finalAmount = total;
    // end session with current date
    session.endedAt = new Date();
    await session.save();

    return res.status(200).json({
      totalAmount: total,
      orders: orders,
    });
  } catch (error) {
    // Write in Logger `Error From While Generating Bill`
    logger.error("Error From While Generating Bill", error);
    next(error);
  }
};

// Handle Payment Cash
const cashPayment = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    // Validate session
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res
        .status(400)
        .json({ message: "Session not found or already closed." });
    }

    // Fetch all unpaid orders of this session
    const unpaidOrders = await Order.find({
      sessionId,
      paymentStatus: "Unpaid",
    });

    for (let order of unpaidOrders) {
      order.paymentMethod = "Cash";
      order.paymentId = "Cash";
      order.paymentOrderId = "Cash";
      order.paymentStatus = "Paid";
      await order.save();
    }

    // Deactivate session
    session.isActive = false;
    session.isPaid = true;
    session.paymentMethod = "Cash";
    session.paymentId = "Cash";
    session.paymentStatus = "Paid";
    await session.save();

    // Free table
    const table = await Table.findOne({ sessionId });
    if (table) {
      table.tableEngage = false;
      table.sessionId = null;
      await table.save();
      // Table status changed: emit update
      const io = req.app.get("io");
      await emitTableStatusUpdate(io);
    }

    return res
      .status(200)
      .json({ message: "Payment completed and session closed." });
  } catch (error) {
    next(error);
  }
};

// Create A Gloabal Variable with key value map for online payment
// Temporary session map to track Razorpay payment context
const paymentSessionMap = new Map(); // key: orderId, value: { sessionId }

// For Online Payment
const onlineRazorPayment = async (req, res,next) => {
  try {
    const { sessionId } = req.body;

    // Validate required fields
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Session Id",
      });
    }
    // Find session by id
    const session = await Session.findOne({ _id: sessionId });

    if (!session || !session.isActive) {
      return res
        .status(400)
        .json({ message: "Session not found or already closed." });
    }

    // Razorpay order options
    const options = {
      amount: session.finalAmount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`, // Generate a unique receipt ID
    };

    // Create order using Razorpay instance
    const order = await instance.orders.create(options);
    // console.log("Razorpay Order created:", order);

    // Store temp session data
    // 🔄 Use new Map: orderId => sessionId
    paymentSessionMap.set(order.id, { sessionId });

    // Respond with the created order details
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    // Log error for server-side debugging
    console.error("Error creating Razorpay order:", error);
    next(error);
  }
};

// For Razorpay Online Payment Final Verification
const RazorPaymentVerification = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


      console.log(`Razorpay Order Id: `,razorpay_order_id);
      console.log(`RazorPay Payment Id:`, razorpay_payment_id);
      console.log(`Razorpay Signature:`, razorpay_signature);


    // 🔄 Retrieve sessionId using new Map
    const sessionData = paymentSessionMap.get(razorpay_order_id);
    if (!sessionData || !sessionData.sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid session mapping" });
    }
    const sessionId = sessionData.sessionId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const unpaidOrders = await Order.find({
      sessionId: sessionId,
      paymentStatus: "Unpaid",
    });

    const session = await Session.findById(sessionId);

    for (let order of unpaidOrders) {
      order.paymentMethod = "Razorpay";
      order.paymentId = razorpay_payment_id;
      order.paymentOrderId = razorpay_order_id;
      order.paymentStatus = "Paid";
      await order.save();
    }

    session.isActive = false;
    session.isPaid = true;
    session.paymentMethod = "Razorpay";
    session.paymentId = razorpay_payment_id;
    session.paymentOrderId = razorpay_order_id;
    session.paymentStatus = "Paid";
    await session.save();

    const table = await Table.findOne({ sessionId: sessionId });
    if (table) {
      table.tableEngage = false;
      table.sessionId = null;
      await table.save();
      // Table status changed: emit update
      const io = req.app.get("io");
      await emitTableStatusUpdate(io);
    }

    // 🔄 Clean up
    paymentSessionMap.delete(razorpay_order_id);
    
    return res.redirect(`${process.env.CORS_SERVER}/paymentsuccess/new?reference=${razorpay_payment_id}&orderId=${razorpay_order_id}`);

  } catch (error) {
    console.error("Error verifying Razorpay payment:", error);
    next(error);
  }
};


const getRazorApiKey =async(req,res,next) =>{
  try {
    return res.status(200).json({key: process.env.RAZORPAY_API_KEY});
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateBill,
  cashPayment,
  onlineRazorPayment,
  RazorPaymentVerification,
  getRazorApiKey
};
