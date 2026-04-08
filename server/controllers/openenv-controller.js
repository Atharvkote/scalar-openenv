/**
 * OpenEnv Bridge Controller
 *
 * Exposes restaurant order data from MongoDB in a flat, simulator-friendly
 * format so the Python OpenEnv environment can seed episodes with real data.
 *
 * Routes are mounted at /api/openenv/* in server.js.
 */

const Order = require("../database/models/order-model");
const logger = require("../utils/logger");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a MongoDB order document to the simplified shape OpenEnv expects.
 *
 * The simulator cares about: id, table, user, status, priority, complexity,
 * and amount.  Everything else (payment, session, etc.) stays in Mongo only.
 */
function _mapOrder(doc) {
  // Derive a rough priority from the order amount (heuristic):
  //   amount >= 500 → vip,  amount >= 200 → normal,  else → low
  let priority = "normal";
  if (doc.amount >= 500) priority = "vip";
  else if (doc.amount < 200) priority = "low";

  // Derive prep_complexity from the number of products (1-3 scale)
  const productCount = Array.isArray(doc.products) ? doc.products.length : 1;
  const prepComplexity = Math.min(3, Math.max(1, productCount));

  // Map Mongo status → OpenEnv status
  const statusMap = {
    "Not Process": "pending",
    Processing: "active",
    Delivered: "completed",
    Cancelled: "rejected",
  };

  return {
    id: doc._id.toString(),
    table_id: doc.tableNo || 1,
    user_id: doc.buyer ? doc.buyer.toString() : "unknown",
    status: statusMap[doc.status] || "pending",
    priority,
    prep_complexity: prepComplexity,
    amount: doc.amount || 0,
    created_at: doc.createdAt || null,
    product_count: productCount,
  };
}

// ---------------------------------------------------------------------------
// Controller actions
// ---------------------------------------------------------------------------

/**
 * GET /api/openenv/orders
 *
 * Returns the most recent orders (capped at 50) in the flat format.
 * Query params:
 *   ?limit=N   max orders to return (default 50)
 *   ?status=X  filter by Mongo status string
 */
const getOrders = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const docs = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const orders = docs.map(_mapOrder);

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    logger.error("OpenEnv getOrders error:", error);
    next(error);
  }
};

/**
 * PATCH /api/openenv/orders/:orderId/status
 *
 * Body: { "status": "Processing" | "Delivered" | "Cancelled" }
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowed = ["Not Process", "Processing", "Delivered", "Cancelled"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowed.join(", ")}`,
      });
    }

    const doc = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      order: _mapOrder(doc),
    });
  } catch (error) {
    logger.error("OpenEnv updateOrderStatus error:", error);
    next(error);
  }
};

/**
 * GET /api/openenv/health
 */
const healthCheck = async (_req, res) => {
  return res.status(200).json({ status: "ok", service: "fooddash-node" });
};

module.exports = {
  getOrders,
  updateOrderStatus,
  healthCheck,
};
