const Order = require("../database/models/order-model");
const mongoose = require("mongoose");

// Helper: Get all orders with at least one Not Process product, and only those products
async function getKitchenQueue() {
  const orders = await Order.find({
    "products.status": "Not Process"
  }, {
    tableNo: 1,
    products: 1,
    createdAt: 1
  })
    .populate("products.service", "name")
    .sort({ createdAt: 1 })
    .lean();

  // Only include Not Process products in each order
  return orders
    .map(order => ({
      id: order._id,
      tableNo: order.tableNo,
      createdAt: order.createdAt,
      products: order.products
        .filter(p => p.status === "Not Process")
        .map(p => ({
          id: p._id,
          name: p.service?.name || "Unknown Item",
          quantity: p.quantity,
          status: p.status
        }))
    }))
    .filter(order => order.products.length > 0);
}

// Socket.io event handlers for kitchen
function kitchenSocketHandler(io) {
  io.on("connection", (socket) => {
    // Join kitchen room
    socket.on("join-kitchen", async () => {
      socket.join("kitchen");
      const queue = await getKitchenQueue();
      socket.emit("kitchen_queue", queue);
    });

    // Client requests current queue
    socket.on("get_kitchen_queue", async () => {
      const queue = await getKitchenQueue();
      socket.emit("kitchen_queue", queue);
    });

    // Mark a product as delivered
    socket.on("deliver_product", async ({ orderId, productId }) => {
      if (!mongoose.isValidObjectId(orderId) || !mongoose.isValidObjectId(productId)) return;
      // Update product status in DB
      await Order.updateOne(
        { _id: orderId, "products._id": productId },
        { $set: { "products.$.status": "Delivered" } }
      );
      // Get updated order (only Not Process products)
      const order = await Order.findById(orderId, { tableNo: 1, products: 1, createdAt: 1 })
        .populate("products.service", "name")
        .lean();
      if (order) {
        const filteredOrder = {
          id: order._id,
          tableNo: order.tableNo,
          createdAt: order.createdAt,
          products: order.products
            .filter(p => p.status === "Not Process")
            .map(p => ({
              id: p._id,
              name: p.service?.name || "Unknown Item",
              quantity: p.quantity,
              status: p.status
            }))
        };
        // Emit update to all kitchen clients
        io.to("kitchen").emit("order_update", filteredOrder);
      }
    });
  });
}

module.exports = {
  getKitchenQueue,
  kitchenSocketHandler
};
