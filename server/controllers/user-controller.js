const User = require("../database/models/user-model");
const Order = require("../database/models/order-model");
const Session = require("../database/models/session-model");
const Service = require("../database/models/service-model");
const logger = require("../utils/logger");
const { default: mongoose } = require("mongoose");

// GET all sessions for a user (latest at top) with populated data
const getAllSessions = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const sessions = await Session.find({ users: userId })
            .populate({
                path: 'orders',
                select: 'amount status paymentStatus createdAt',
                options: { sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 });

        if (!sessions || sessions.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "No sessions found for user" 
            });
        }

        // Calculate total orders and amount for each session
        const sessionsWithStats = sessions.map(session => {
            const totalOrders = session.orders ? session.orders.length : 0;
            const totalAmount = session.orders ? 
                session.orders.reduce((sum, order) => sum + (order.amount || 0), 0) : 0;
            
            return {
                _id: session._id,
                tableNo: session.tableNo,
                isActive: session.isActive,
                isPaid: session.isPaid,
                paymentStatus: session.paymentStatus,
                paymentMethod: session.paymentMethod,
                finalAmount: session.finalAmount || totalAmount,
                startedAt: session.startedAt,
                endedAt: session.endedAt,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
                totalOrders,
                totalAmount,
                orders: session.orders || []
            };
        });

        res.status(200).json({
            success: true,
            data: sessionsWithStats
        });
    } catch (error) {
        logger.error("Error in getAllSessions:", error);
        next(error);
    }
};

// GET all orders for a specific session with detailed product information
const getOrdersBySession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        // Verify session belongs to user
        const session = await Session.findOne({ 
            _id: sessionId, 
            users: userId 
        });

        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "Session not found or access denied" 
            });
        }

        const orders = await Order.find({ sessionId })
            .populate({
                path: 'products.service',
                select: 'name description price category image vegetarian spicy available'
            })
            .sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: "No orders found for this session" 
            });
        }

        // Transform orders to match frontend expectations
        const transformedOrders = orders.map(order => {
            const items = order.products.map(product => ({
                id: product._id,
                name: product.service.name,
                description: product.service.description,
                price: product.service.price,
                quantity: product.quantity,
                category: product.service.category,
                image: product.service.image,
                vegetarian: product.service.vegetarian,
                spicy: product.service.spicy,
                status: product.status,
                totalPrice: product.service.price * product.quantity
            }));

            return {
                id: order._id,
                sessionId: order.sessionId,
                tableNo: order.tableNo,
                items,
                amount: order.amount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                totalItems: items.length,
                estimatedTime: getEstimatedTime(order.status)
            };
        });

        // Calculate session totals
        const totalAmount = transformedOrders.reduce((sum, order) => sum + order.amount, 0);
        const totalOrders = transformedOrders.length;
        const pendingOrders = transformedOrders.filter(order => order.status === "Processing" || order.status === "Not Process");
        const deliveredOrders = transformedOrders.filter(order => order.status === "Delivered");

        res.status(200).json({
            success: true,
            data: {
                session: {
                    _id: session._id,
                    tableNo: session.tableNo,
                    isActive: session.isActive,
                    isPaid: session.isPaid,
                    paymentStatus: session.paymentStatus,
                    paymentMethod: session.paymentMethod,
                    finalAmount: session.finalAmount || totalAmount,
                    startedAt: session.startedAt,
                    endedAt: session.endedAt
                },
                orders: transformedOrders,
                summary: {
                    totalAmount,
                    totalOrders,
                    pendingOrders: pendingOrders.length,
                    deliveredOrders: deliveredOrders.length
                }
            }
        });
    } catch (error) {
        logger.error("Error in getOrdersBySession:", error);
        next(error);
    }
};

// GET active session for user with order details
const getActiveSession = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const session = await Session.findOne({ 
            users: userId, 
            isActive: true 
        }).populate({
            path: 'orders',
            select: 'amount status paymentStatus createdAt'
        });

        if (!session) {
            return res.status(404).json({ 
                success: false,
                message: "No active session found" 
            });
        }

        // Get detailed orders for active session
        const orders = await Order.find({ sessionId: session._id })
            .populate({
                path: 'products.service',
                select: 'name description price category image vegetarian spicy available'
            })
            .sort({ createdAt: -1 });

        const transformedOrders = orders.map(order => {
            const items = order.products.map(product => ({
                id: product._id,
                name: product.service.name,
                description: product.service.description,
                price: product.service.price,
                quantity: product.quantity,
                category: product.service.category,
                image: product.service.image,
                vegetarian: product.service.vegetarian,
                spicy: product.service.spicy,
                status: product.status,
                totalPrice: product.service.price * product.quantity
            }));

            return {
                id: order._id,
                items,
                amount: order.amount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                totalItems: items.length,
                estimatedTime: getEstimatedTime(order.status)
            };
        });

        const totalAmount = transformedOrders.reduce((sum, order) => sum + order.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                session: {
                    _id: session._id,
                    tableNo: session.tableNo,
                    isActive: session.isActive,
                    isPaid: session.isPaid,
                    paymentStatus: session.paymentStatus,
                    finalAmount: session.finalAmount || totalAmount
                },
                orders: transformedOrders,
                totalAmount,
                totalOrders: transformedOrders.length
            }
        });
    } catch (error) {
        logger.error("Error in getActiveSession:", error);
        next(error);
    }
};

// GET user profile information
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error("Error in getUserProfile:", error);
        next(error);
    }
};

// UPDATE user profile
const updateUserProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, phone } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        logger.error("Error in updateUserProfile:", error);
        next(error);
    }
};

// GET order history with pagination
const getOrderHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;
        
        const skip = (page - 1) * limit;
        
        let query = { buyer: userId };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate({
                path: 'products.service',
                select: 'name description price category image vegetarian spicy'
            })
            .populate('sessionId', 'tableNo isActive startedAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);

        const transformedOrders = orders.map(order => {
            const items = order.products.map(product => ({
                id: product._id,
                name: product.service.name,
                description: product.service.description,
                price: product.service.price,
                quantity: product.quantity,
                category: product.service.category,
                image: product.service.image,
                vegetarian: product.service.vegetarian,
                spicy: product.service.spicy,
                status: product.status,
                totalPrice: product.service.price * product.quantity
            }));

            return {
                id: order._id,
                tableNo: order.tableNo,
                items,
                amount: order.amount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentMethod: order.paymentMethod,
                createdAt: order.createdAt,
                session: order.sessionId,
                totalItems: items.length
            };
        });

        res.status(200).json({
            success: true,
            data: {
                orders: transformedOrders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNextPage: page * limit < totalOrders,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        logger.error("Error in getOrderHistory:", error);
        next(error);
    }
};

// Helper function to get estimated time based on order status
const getEstimatedTime = (status) => {
    switch (status) {
        case "Not Process":
            return "15-20 minutes";
        case "Processing":
            return "5-10 minutes";
        case "Delivered":
            return "Delivered";
        case "Cancelled":
            return "Cancelled";
        default:
            return "15-20 minutes";
    }
};

module.exports = {
    getAllSessions,
    getOrdersBySession,
    getActiveSession,
    getUserProfile,
    updateUserProfile,
    getOrderHistory
};
