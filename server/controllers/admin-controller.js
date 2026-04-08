const Admin = require('../database/models/admin-model');
const User = require('../database/models/user-model');
const Order = require('../database/models/order-model');
const Session = require('../database/models/session-model');
const Table = require('../database/models/table-model');
const mongoose = require('mongoose');

// socketController.js
const kitchenMessage = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const sendInitialOrders = async (room) => {
      try {
        const processedOrders = await Order.find({
          status: { $ne: "Not Process" },
        })
          .populate("products.service")
          .populate("buyer", "name email")
          .sort({ createdAt: 1 }); // Oldest first

        const pendingOrders = await Order.find({
          status: "Not Process",
        })
          .populate("products.service")
          .populate("buyer", "name email")
          .sort({ createdAt: 1 }); // Newest last

        const fullOrderList = [...processedOrders, ...pendingOrders];

        // Emit to the user only
        socket.emit("initial-orders", {
          room,
          orders: fullOrderList,
        });
      } catch (err) {
        console.error(`Error sending initial orders to ${room}:`, err);
        socket.emit("error", { message: `Could not load initial orders for ${room}` });
      }
    };

    socket.on("join-kitchen", async () => {
      socket.join("kitchen");
      console.log(`Socket ${socket.id} joined kitchen room`);
      await sendInitialOrders("kitchen");
    });

    socket.on("join-admin", async () => {
      socket.join("admin");
      console.log(`Socket ${socket.id} joined admin room`);
      await sendInitialOrders("admin");
    });

    socket.on("join-table", (tableNo) => {
      const room = `table-${tableNo}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

//-----------------------
// Update Order Product Shipping Status  
//--------------------------
// PATCH /api/orders/:orderId/products/:productId/status
const updateProductStatus = async (req, res, next) => {
  try {
    const { orderId, productId } = req.params;
    const { status } = req.body;

    // Validate IDs
    if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid order or product ID" });
    }

    // Validate status
    const allowedStatuses = ["Not Process", "Processing", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // Find the order and update the product's status
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        "products._id": productId,
      },
      {
        $set: {
          "products.$.status": status,
        },
      },
      { new: true }
    ).populate("products.service");

    if (!order) {
      return res.status(404).json({ message: "Order or product not found" });
    }

    res.status(200).json({
      message: "Product status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating product status:", error);
    next(error);
  }
};

// ===========================================
// SESSION MANAGEMENT WEBSOCKET FUNCTIONALITY
// ===========================================

// In-memory flags to track change streams
let isWatchingSessionData = false;
let isWatchingAdminData = false;

// Helper function to calculate duration
const getDurationInMinutes = (startTime, endTime = null) => {
  if (!startTime) return 0;
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  return Math.floor((end - start) / 60000);
};

// Helper function to format duration for display
const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Get comprehensive session data for session management
const getSessionManagementData = async () => {
  try {
    // Get all sessions with populated data
    const sessions = await Session.find({})
      .populate({
        path: 'users',
        select: 'name email phone'
      })
      .populate({
        path: 'orders',
        populate: {
          path: 'products.service',
          select: 'name price'
        }
      })
      .sort({ isActive: -1, startedAt: -1 }); // Active sessions first, then by start time

    // Transform sessions for frontend
    const transformedSessions = sessions.map(session => {
      // Calculate total amount from orders
      const totalAmount = session.orders.reduce((sum, order) => {
        return sum + order.products.reduce((orderSum, product) => {
          return orderSum + (product.service?.price || 0) * product.quantity;
        }, 0);
      }, 0);

      // Transform orders for display
      const transformedOrders = session.orders.map(order => ({
        id: order._id,
        amount: order.amount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        products: order.products.map(product => ({
          id: product._id,
          name: product.service?.name || 'Unknown Item',
          quantity: product.quantity,
          status: product.status,
          price: product.service?.price || 0
        }))
      }));

      // Transform users for display
      const transformedUsers = session.users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }));

      return {
        id: session._id,
        tableNo: session.tableNo,
        isActive: session.isActive,
        isPaid: session.isPaid,
        users: transformedUsers,
        orders: transformedOrders,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        paymentMethod: session.paymentMethod,
        paymentStatus: session.paymentStatus,
        paymentId: session.paymentId,
        paymentOrderId: session.paymentOrderId,
        finalAmount: session.finalAmount || totalAmount,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        duration: getDurationInMinutes(session.startedAt, session.endedAt),
        durationFormatted: formatDuration(getDurationInMinutes(session.startedAt, session.endedAt))
      };
    });

    // Separate active and completed sessions
    const activeSessions = transformedSessions.filter(s => s.isActive);
    const completedSessions = transformedSessions.filter(s => !s.isActive);

    // Calculate stats
    const stats = {
      total: transformedSessions.length,
      active: activeSessions.length,
      inactive: completedSessions.length,
      paid: transformedSessions.filter(s => s.isPaid).length,
      unpaid: transformedSessions.filter(s => !s.isPaid).length
    };

    return {
      sessions: transformedSessions,
      activeSessions,
      completedSessions,
      stats
    };
  } catch (error) {
    console.error('Error fetching session management data:', error);
    throw error;
  }
};

// Emit session management updates
const emitSessionManagementUpdate = async (io) => {
  try {
    const data = await getSessionManagementData();
    console.log('📤 Emitting session management update:', {
      totalSessions: data.sessions.length,
      activeSessions: data.activeSessions.length,
      completedSessions: data.completedSessions.length
    });
    
    // Emit to session management room
    io.to('session-management').emit('session_management_update', data);
    
    // Also emit to admin room for general updates
    io.to('admin').emit('session_management_update', data);
  } catch (err) {
    console.error('❌ Error emitting session management update:', err);
  }
};

// Watch MongoDB collections for session management
const watchSessionManagementChanges = async (io) => {
  if (isWatchingSessionData) return;
  isWatchingSessionData = true;

  console.log('👀 Starting session management change streams...');

  // Watch Session collection
  const sessionStream = Session.watch([], { 
    fullDocument: 'updateLookup',
    fullDocumentBeforeChange: 'whenAvailable'
  });

  // Watch Order collection
  const orderStream = Order.watch([], { 
    fullDocument: 'updateLookup',
    fullDocumentBeforeChange: 'whenAvailable'
  });

  // Watch User collection for user updates
  const userStream = User.watch([], { 
    fullDocument: 'updateLookup',
    fullDocumentBeforeChange: 'whenAvailable'
  });

  const handleSessionChange = async (change) => {
    console.log('🌀 Session change detected:', change.operationType);
    await emitSessionManagementUpdate(io);
  };

  const handleOrderChange = async (change) => {
    console.log('🌀 Order change detected:', change.operationType);
    await emitSessionManagementUpdate(io);
  };

  const handleUserChange = async (change) => {
    console.log('🌀 User change detected:', change.operationType);
    await emitSessionManagementUpdate(io);
  };

  const handleError = (err, source) => {
    console.error(`❌ MongoDB Change Stream Error in ${source}:`, err);
    // Attempt to restart the stream
    setTimeout(() => {
      console.log(`🔄 Restarting ${source} change stream...`);
      isWatchingSessionData = false;
      watchSessionManagementChanges(io);
    }, 5000);
  };

  sessionStream.on('change', handleSessionChange);
  orderStream.on('change', handleOrderChange);
  userStream.on('change', handleUserChange);

  sessionStream.on('error', (err) => handleError(err, 'Session'));
  orderStream.on('error', (err) => handleError(err, 'Order'));
  userStream.on('error', (err) => handleError(err, 'User'));

  console.log('✅ Session management change streams active');
};

// Shared function to get table status data
const getTableStatusData = async () => {
  const tables = await Table.find({}).populate({
    path: "sessionId",
    populate: [
      { path: "users", model: "Users" },
      { path: "orders", model: "Order", populate: { path: "products.service" } },
    ],
  });

  return tables.map((table) => {
    const session = table.sessionId;
    const computedFinalAmount = session?.orders?.reduce((total, order) => {
      return (
        total +
        order.products.reduce((orderTotal, product) => {
          return orderTotal + (product?.service?.price || 0) * (product?.quantity || 0);
        }, 0)
      );
    }, 0) || 0;

    return {
      id: table._id,
      number: table.tableNo,
      status: table.tableEngage ? "reserved" : "available",
      sessionId: session?._id,
      reservedBy: session ? {
        name: session?.users?.[0]?.name || "Guest",
        contact: session?.users?.[0]?.email || "",
        phone:session?.users?.[0]?.phone || "",
        duration: getDurationInMinutes(session.startedAt),
        createdAt: session.startedAt,
        users: session.users?.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone,
        })),
        orders: session?.orders?.map((order) => ({
          id: order._id,
          amount: order.amount,
          status: order.status,
          paymentStatus: order.paymentStatus,
          products: order.products.map((p) => ({
            name: p.service?.name || "Unknown Item",
            quantity: p.quantity,
            status: p.status,
            price: p.service?.price,
          }))
        })),
        isPaid: session.isPaid,
        paymentMethod: session.paymentMethod,
        paymentStatus: session.paymentStatus,
        finalAmount: computedFinalAmount,
      } : null
    };
  });
};

// Emit updated data to all connected clients 
const emitTableStatusUpdate = async (io) => {
  try {
    const data = await getTableStatusData();
    console.log("📤 Emitting table status update");
    io.emit("table_status_update", data);
  } catch (err) {
    console.error("❌ Error emitting table status update:", err);
  }
};

// Watch MongoDB collections and trigger updates
const watchAdminDashboardChanges = async (io) => {
  if (isWatchingAdminData) return;
  isWatchingAdminData = true;

  const tableStream = Table.watch([], { fullDocument: "updateLookup" });
  const orderStream = Order.watch([], { fullDocument: "updateLookup" });
  const sessionStream = Session.watch([], { fullDocument: "updateLookup" });

  const handleChange = async (source) => {
    console.log(`🌀 Change detected in ${source} collection`);
    await emitTableStatusUpdate(io);
  };

  const handleError = (err, source) => {
    console.error(`❌ MongoDB Change Stream Error in ${source}:`, err);
  };

  tableStream.on("change", () => handleChange("Table"));
  orderStream.on("change", () => handleChange("Order"));
  sessionStream.on("change", () => handleChange("Session"));

  tableStream.on("error", (err) => handleError(err, "Table"));
  orderStream.on("error", (err) => handleError(err, "Order"));
  sessionStream.on("error", (err) => handleError(err, "Session"));

  console.log("👀 Watching admin dashboard changes...");
};

// Enhanced Socket.IO connection handler for session management
const setupSocketIO = (io) => {
  io.on("connection", async (socket) => {
    console.log("🟢 Client connected:", socket.id);

    // Handle session management room joins
    socket.on("join-session-management", async () => {
      socket.join("session-management");
      console.log(`Socket ${socket.id} joined session-management room`);
      
      try {
        const data = await getSessionManagementData();
        socket.emit("session_management_update", data);
        console.log("📤 Sent initial session management data");
      } catch (err) {
        console.error("❌ Error sending initial session management data:", err);
        socket.emit("error", { message: "Could not load session management data" });
      }
    });

    // // Handle admin room joins
    // socket.on("join-admin", async () => {
    //   socket.join("admin");
    //   console.log(`Socket ${socket.id} joined admin room`);
      
      try {
        const data = await getTableStatusData();
        socket.emit("table_status_update", data);
      } catch (err) {
        console.error("❌ Error sending initial admin data:", err);
      }
    // });

    // Handle kitchen room joins
    socket.on("join-kitchen", async () => {
      socket.join("kitchen");
      console.log(`Socket ${socket.id} joined kitchen room`);
    });

    // Handle table-specific room joins
    socket.on("join-table", (tableNo) => {
      const room = `table-${tableNo}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    // Handle session-specific room joins
    socket.on("join-session", (sessionId) => {
      const room = `session-${sessionId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });

  // Start watching DB changes for real-time updates
  watchAdminDashboardChanges(io);
  watchSessionManagementChanges(io);
};

// ===========================================
// USER MANAGEMENT FUNCTIONALITY
// ===========================================

// Get all users with pagination and filtering
const getAllUsers = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      status = "all",
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    const skip = (page - 1) * limit;
    
    // Build filter conditions
    let filterConditions = {};
    
    // Search filter
    if (search) {
      filterConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter (for future use when status field is added)
    if (status && status !== 'all') {
      // filterConditions.status = status;
    }

    // Build sort conditions
    const sortConditions = {};
    sortConditions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filterConditions)
      .select('-password')
      .sort(sortConditions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filterConditions);

    // Calculate stats
    const totalActive = await User.countDocuments({ isGoogleAccount: false });
    const totalGoogle = await User.countDocuments({ isGoogleAccount: true });
    const totalInactive = 0; // For future use when status field is added

    const stats = {
      total: totalUsers,
      active: totalActive,
      inactive: totalInactive,
      pending: totalGoogle, // Google users as pending for now
    };

    // Format response
    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name || 'Guest User',
      email: user.email,
      phone: user.phone || 'Not provided',
      status: user.isGoogleAccount ? 'active' : 'pending',
      joinDate: user.createdAt,
      isGoogleAccount: user.isGoogleAccount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.status(200).json({
      success: true,
      users: formattedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: skip + users.length < totalUsers,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    next(error);
  }
};

// Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const formattedUser = {
      id: user._id,
      name: user.name || 'Guest User',
      email: user.email,
      phone: user.phone || 'Not provided',
      status: user.isGoogleAccount ? 'active' : 'pending',
      joinDate: user.createdAt,
      isGoogleAccount: user.isGoogleAccount,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      user: formattedUser
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
};

// Create new user
const createUser = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required: name, email, phone, password"
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password,
      isGoogleAccount: false
    });

    await newUser.save();

    // Return user without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      status: 'active',
      joinDate: newUser.createdAt,
      isGoogleAccount: false,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userResponse
    });

  } catch (error) {
    console.error('Error creating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, password } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists"
        });
      }
    }

    // Update fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (password) updateFields.password = password;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    const userResponse = {
      id: updatedUser._id,
      name: updatedUser.name || 'Guest User',
      email: updatedUser.email,
      phone: updatedUser.phone || 'Not provided',
      status: updatedUser.isGoogleAccount ? 'active' : 'pending',
      joinDate: updatedUser.createdAt,
      isGoogleAccount: updatedUser.isGoogleAccount,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    };

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userResponse
    });

  } catch (error) {
    console.error('Error updating user:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid user ID format" 
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user has active sessions or orders
    const activeSession = await Session.findOne({ 
      users: userId, 
      isActive: true 
    });

    if (activeSession) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete user with active session"
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    next(error);
  }
};

// Get user statistics
const getUserStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const googleUsers = await User.countDocuments({ isGoogleAccount: true });
    const regularUsers = await User.countDocuments({ isGoogleAccount: false });

    // Get users created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const stats = {
      total: totalUsers,
      active: regularUsers,
      inactive: 0, // For future use
      pending: googleUsers,
      recentUsers,
      googleUsers,
      regularUsers
    };

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    next(error);
  }
};





// -------------------------
// Order Management - Real-time with Socket.IO
// -------------------------

// Helper: Get all orders with populated fields and stats
const getAllOrdersWithStats = async () => {
  const orders = await Order.find({})
    .populate("buyer", "name email")
    .populate("products.service")
    .sort({ createdAt: -1 });

  // Transform orders for frontend
  const transformedOrders = orders.map(order => ({
    id: order._id.toString(),
    sessionId: order.sessionId ? order.sessionId.toString() : null,
    buyer: order.buyer ? {
      id: order.buyer._id?.toString() || "",
      name: order.buyer.name || "",
      email: order.buyer.email || ""
    } : { id: "", name: "", email: "" },
    tableNo: order.tableNo,
    products: order.products.map(product => ({
      id: product._id?.toString() || "",
      service: product.service ? {
        id: product.service._id?.toString() || "",
        name: product.service.name || "",
        price: product.service.price || 0
      } : { id: "", name: "", price: 0 },
      status: product.status,
      quantity: product.quantity
    })),
    amount: order.amount,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    paymentId: order.paymentId,
    paymentOrderId: order.paymentOrderId,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  }));

  // Stats
  const stats = {
    total: transformedOrders.length,
    processing: transformedOrders.filter(o => o.status === "Not Process").length,
    delivered: transformedOrders.filter(o => o.status === "Delivered").length,
    paid: transformedOrders.filter(o => o.paymentStatus === "Paid").length,
    cancelled: transformedOrders.filter(o => o.status === "Cancelled").length,
    totalRevenue: transformedOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
  };

  return { orders: transformedOrders, stats };
};

// Emit order_management_update to all admins
const emitOrderManagementUpdate = async (io) => {
  const data = await getAllOrdersWithStats();
  io.to("order-management").emit("order_management_update", data);
};

// Watch Order collection for real-time updates
let isWatchingOrderData = false;
const watchOrderManagementChanges = (io) => {
  if (isWatchingOrderData) return;
  isWatchingOrderData = true;
  const orderStream = Order.watch([], { fullDocument: "updateLookup" });
  orderStream.on("change", async () => {
    await emitOrderManagementUpdate(io);
  });
  orderStream.on("error", (err) => {
    console.error("Order Change Stream Error:", err);
    setTimeout(() => {
      isWatchingOrderData = false;
      watchOrderManagementChanges(io);
    }, 5000);
  });
  console.log("👀 Watching order management changes...");
};

// Socket.IO handler for order management
const setupOrderManagementSocket = (io) => {
  io.on("connection", (socket) => {
    // Join admin order management room
    socket.on("join-order-management", async () => {
      socket.join("order-management");
      try {
        const data = await getAllOrdersWithStats();
        socket.emit("order_management_update", data);
      } catch (err) {
        socket.emit("error", { message: "Could not load orders" });
      }
    });

    // Create order
    socket.on("create_order", async (orderData, cb) => {
      try {
        const newOrder = new Order(orderData);
        await newOrder.save();
        await emitOrderManagementUpdate(io);
        if (cb) cb({ success: true });
      } catch (err) {
        if (cb) cb({ success: false, error: err.message });
      }
    });

    // Update order
    socket.on("update_order", async ({ orderId, update }, cb) => {
      console.log("Updating order:", orderId, update);
      try {
        const result = await Order.findByIdAndUpdate(orderId, update, { new: true });
        console.log("Update result:", result);
        await emitOrderManagementUpdate(io);
        if (cb) cb({ success: true });
      } catch (err) {
        if (cb) cb({ success: false, error: err.message });
      }
    });

    // Delete order
    socket.on("delete_order", async (orderId, cb) => {
      try {
        await Order.findByIdAndDelete(orderId);
        await emitOrderManagementUpdate(io);
        if (cb) cb({ success: true });
      } catch (err) {
        if (cb) cb({ success: false, error: err.message });
      }
    });

    // Update product status in order
    socket.on("update_product_status", async ({ orderId, productId, status }, cb) => {
      try {
        await Order.findOneAndUpdate(
          { _id: orderId, "products._id": productId },
          { $set: { "products.$.status": status } },
          { new: true }
        );
        await emitOrderManagementUpdate(io);
        if (cb) cb({ success: true });
      } catch (err) {
        if (cb) cb({ success: false, error: err.message });
      }
    });
  });
  watchOrderManagementChanges(io);
};

// ✅ Correct export
module.exports = {
  kitchenMessage,
  updateProductStatus,
  setupSocketIO,
  getSessionManagementData,
  emitSessionManagementUpdate,
  emitTableStatusUpdate,
  // User Management exports
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  setupOrderManagementSocket,
  getAllOrdersWithStats,
  emitOrderManagementUpdate,
};
