const mongoose = require("mongoose");
const User = require("../database/models/user-model");
const Order = require("../database/models/order-model");
const Table = require("../database/models/table-model");
const Session = require("../database/models/session-model");
const logger = require("../utils/logger");
const RecommendationEngine = require("../utils/recommendation-engine");
const { emitTableStatusUpdate } = require('./admin-controller'); // Import at top

// ----------------------
// TOTP GENERATING LOGIC
// ----------------------
let currentNumber = null;
let totpInterval = null;
let broadcastInterval = null;
let ioInitialized = false;
let timeRemaining = 0; // Time remaining in the current cycle
let generationTime = null; // Track when TOTP was generated
// ----------------------

// Utility: Generate 6-digit TOTP
function generateRandomNumber() {
  currentNumber = Math.floor(100000 + Math.random() * 900000);
  generationTime = Date.now(); // Record the time when TOTP was generated
}

// Get Current TOTP
function getCurrentNumber() {
  return currentNumber;
}

// Calculate the remaining time until the next TOTP generation
function getRemainingTime() {
  if (generationTime === null) return 0;
  const elapsed = Date.now() - generationTime;
  const remaining = 30000 - (elapsed % 30000); // 30 seconds cycle
  return Math.max(remaining, 0); // Ensure it's non-negative
}

// Emit to only active clients
function broadcastToConnectedClients(io, event, data) {
  for (let [id, socket] of io.of("/").sockets) {
    socket.emit(event, data);
  }
}

// MAIN FUNCTION TO START EVERYTHING
function startTotpGeneration(io) {
  if (ioInitialized) return console.log("⚠️ TOTP system already started.");
  ioInitialized = true;

  // TOTP generation
  generateRandomNumber();
  broadcastToConnectedClients(io, "newTotp", {
    totp: getCurrentNumber(),
    timeRemaining: getRemainingTime(),
  });

  totpInterval = setInterval(() => {
    generateRandomNumber();
    broadcastToConnectedClients(io, "newTotp", {
      totp: getCurrentNumber(),
      timeRemaining: getRemainingTime(),
    });
  }, 30000);

  // broadcastInterval = setInterval(() => {
  //     broadcastToConnectedClients(io, "newTotp", getCurrentNumber());
  // }, 1000);

  console.log("✅ TOTP generation started and broadcasting...");

  // Connection Handling
  io.on("connection", (socket) => {
    console.log(`📶 New client connected: ${socket.id}`);

    // Send current TOTP and remaining time immediately
    if (getCurrentNumber() !== null) {
      const remainingTime = getRemainingTime();
      // console.log(
      //     "newTotp",
      //     getCurrentNumber(),
      //     "Time remaining:",
      //     remainingTime
      // );
      socket.emit("newTotp", {
        totp: getCurrentNumber(),
        timeRemaining: remainingTime,
      });
    }

    socket.on("data", (data) => {
      console.log(`📩 Data from ${socket.id}:`, data);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

// -------------------------------------

// Start And JOIN Session When QR Code is Scanned
const startOrJoinSession = async (req, res, next) => {
  try {
    const { tableNo, userId } = req.body;
    if (!tableNo || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const table = await Table.findOne({ tableNo: tableNo });
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    let session;
    if (table.tableEngage && table.sessionId) {
      session = await Session.findById(table.sessionId);
      if (!session || !session.isActive) {
        return res.status(404).json({ message: "Session is Closed" });
      }

      // ✅ (2) table busy AND current user NOT in session → forbid
      const alreadyInSession = session.users.some(
        (u) => u.toString() === userId.toString()
      );

      if (!alreadyInSession) {
        return res
          .status(403)
          .json({ message: "Table is already engaged by another user." });
      }
      // No table status change, so no emit needed here
    } else {
      // Start New Session
      session = await Session.create({
        tableNo,
        users: [userId],
        isActive: true,
      });

      (table.tableEngage = true), (table.sessionId = session._id);
      await table.save();
      // Table status changed: emit update
      const io = req.app.get("io");
      await emitTableStatusUpdate(io);
    }

    return res.status(200).json({
      message: "Session started or joined successfully",
      session: session,
    });
  } catch (error) {
    console.log(`Error While Start or Join Session: `, error);
    next(error);
  }
};

// Place The Order

const placeOrder = async (req, res, next) => {
  try {
    const { sessionId, userId, cart, amount, tableNo, TOTP } = req.body;
    if (!sessionId || !userId || !cart || !amount || !tableNo || !TOTP) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (
      !mongoose.isValidObjectId(sessionId) ||
      !mongoose.isValidObjectId(userId)
    ) {
      return res.status(400).json({ message: "Invalid Session or User Id" });
    }

    // CHECK here
    if (Number(currentNumber) !== Number(TOTP)) {
      console.log(
        `[ORDER] TOTP Submitted: ${TOTP}, Expected: ${currentNumber}`
      );
      return res.status(403).json({ message: "Invalid TOTP" });
    }

    // Session Find
    const session = await Session.findById(sessionId);
    if (!session || !session.isActive) {
      return res.status(403).json({ message: "Invalid Session" });
    }

    // Create Order
    const order = await Order.create({
      sessionId,
      buyer: userId,
      tableNo,
      products: cart,
      amount,
      paymentMethod: "Pending",
      paymentStatus: "Unpaid",
    });

    // put this order id in session order array
    session.orders.push(order._id);
    await session.save();

    // Update user preferences for recommendations (background task)
    try {
      const recommendationEngine = new RecommendationEngine();
      await recommendationEngine.updateUserPreferences(userId);
      logger.info(
        `Updated user preferences for user ${userId} after order placement`
      );
    } catch (error) {
      logger.error("Error updating user preferences:", error);
      // Don't fail the order if recommendation update fails
    }

    // Emit Message for Notify kitchen/admin

    // Query to populate the 'service' in the order products
    const populatedOrder = await Order.findById(order._id).populate(
      "products.service"
    );

    const io = req.app.get("io"); // Make sure to set it in your app.js
    // Prepare minimal kitchen order data
    const kitchenOrder = {
      id: populatedOrder._id,
      tableNo: populatedOrder.tableNo,
      createdAt: populatedOrder.createdAt,
      products: populatedOrder.products
        .filter((p) => p.status === "Not Process")
        .map((p) => ({
          id: p._id,
          name: p.service?.name || "Unknown Item",
          quantity: p.quantity,
          status: p.status,
        })),
    };
    if (kitchenOrder.products.length > 0) {
      io.to("kitchen").emit("new_order", kitchenOrder);
    }
    io.to("admin").emit("new-order", {
      message: "A new order has been placed",
      order: populatedOrder,
      tableNo,
      sessionId,
    });

    return res.status(201).json({
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.log(`Error While Place Order: `, error);
    next(error);
  }
};

// MERGE Session (For Table Shift)

const mergeSession = async (req, res, next) => {
  try {
    const { fromTable, toTable } = req.body;
    if (!fromTable || !toTable) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Tables Exist or not
    const fromTb1 = await Table.findOne({ tableNo: fromTable });
    const toTb1 = await Table.findOne({ tableNo: toTable });

    if (!fromTb1 || !toTb1) {
      return res.status(404).json({ message: "Table not found" });
    }
    // check if From table has session or not
    if (!fromTb1.sessionId) {
      return res.status(404).json({ message: "From table has no session" });
    }
    const fromSession = await Session.findById(fromTb1.sessionId);
    const fromOrders = await Order.find({ sessionId: fromSession._id });

    // ✅ Case 1: toTable is already engaged (merge both sessions)
    if (toTb1.sessionId) {
      const toSession = await Session.findById(toTb1.sessionId);

      // Merge Orders
      for (let order of fromOrders) {
        order.sessionId = toSession._id;
        order.tableNo = toTb1.tableNo;
        await order.save();
      }

      // Merge Users
      toSession.users = [
        ...new Set([...toSession.users, ...fromSession.users]),
      ];
      await toSession.save();

      // Optionally delete from session or mark inactive
      fromSession.isActive = false;
      await fromSession.save();

      // Free from table
      fromTb1.sessionId = null;
      fromTb1.tableEngage = false;
      await fromTb1.save();

      // return
      const io = req.app.get("io");
      await emitTableStatusUpdate(io);
      return res.status(200).json({ message: "Session merged successfully" });
    }

    // ✅ Case 2: toTable is FREE — just move session to it
    toTb1.sessionId = fromSession._id;
    toTb1.tableEngage = true;
    await toTb1.save();

    fromOrders.forEach(async (order) => {
      order.tableNo = toTb1.tableNo;
      await order.save();
    });

    // Free From table
    fromTb1.sessionId = null;
    fromTb1.tableEngage = false;
    await fromTb1.save();

    const io = req.app.get("io");
    await emitTableStatusUpdate(io);
    return res.status(200).json({ message: "Session moved successfully" });
  } catch (error) {
    console.log(`Error While Merge Session: `, error);
    next(error);
  }
};

// GET Particular Session All Details
const getSessionById = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({ message: "Invalid Session Id" });
    }

    // Find session by ID and populate necessary fields
    const session = await Session.findById(sessionId)
      .populate({
        path: "orders",
        populate: {
          path: "products.service",
          model: "Service",
        },
      })
      .populate("users")
      .populate("mergedFrom");

    // If session not found
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Return session details
    return res.status(200).json({ session });
  } catch (error) {
    logger.info("Error From getSessionById: ", error);
    next(error);
  }
};

module.exports = {
  startTotpGeneration,
  startOrJoinSession,
  placeOrder,
  mergeSession,
  getSessionById,
};
