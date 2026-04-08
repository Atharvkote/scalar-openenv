const express = require("express");
const router = express.Router();
const openenvController = require("../controllers/openenv-controller");

// GET  /api/openenv/health              — Bridge health check
router.get("/health", openenvController.healthCheck);

// GET  /api/openenv/orders              — Fetch orders for OpenEnv seeding
router.get("/orders", openenvController.getOrders);

// PATCH /api/openenv/orders/:orderId/status — Push status updates from simulator
router.patch("/orders/:orderId/status", openenvController.updateOrderStatus);

module.exports = router;
