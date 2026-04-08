// server.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const cookieParser = require("cookie-parser");
const path = require("path");
const helmet = require("helmet");
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('ioredis');

// Rate Limiter
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_URL);

// Workers
const connectToDatabase = require("./database/db");
const logger = require('./utils/logger'); // Import the logger
const { initializeRecommendationEngine } = require('./controllers/recommendation-controller');

// Middleware
const errorMiddleware = require("./middlewares/error-middleware");



// Importing Router
const authRoute = require('./routes/auth-router');
const paymentRoute = require('./routes/payment-router');
const orderRoute =  require('./routes/order-router');
const serviceRoute = require('./routes/service-router');
const contactRoute = require('./routes/contact-router');
// const recommendRoute =require ('./routes/recommend-router');
const recommendationRoute = require('./routes/recommendation-router');
const adminRoute = require('./routes/admin-router');
const userRoute = require('./routes/user-router');
const openenvRoute = require('./routes/openenv-router');
// websocket broadcaster
const {startTotpGeneration}= require('./controllers/order-controller');
const { kitchenSocketHandler } = require('./controllers/kitchen-controller');
const {setupSocketIO} = require('./controllers/admin-controller');
const { setupOrderManagementSocket } = require('./controllers/admin-controller');

// Server Setup
// Server
const app = express();
const server = http.createServer(app);
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
    })
);
app.set("trust proxy", 1); // Trust first proxy (e.g., Nginx, Cloudflare)

app.use(cookieParser());

// Cors

const allowedOrigins = ["http://localhost:5173"];
const PORT = process.env.PORT || 5000;
// CORS Policy
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "DELETE", "PATCH", "HEAD", "PUT"],
        credentials: true,
    },
    pingInterval: 5000,
    pingTimeout: 20000,
    allowEIO3: true, // backward compatibility
    transports: ["websocket", "polling"],
    allowUpgrades: true,
    maxHttpBufferSize: 1e8,
    cookie: false,
    serveClient: false,
    
});

// Redis Adapter setup
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));


app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, origin); // ✅ Allow only one
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// DDos Protection
//DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 100,
    duration: 30,
    blockDuration: 15,
});

app.use((req, res, next) => {
    rateLimiter
        .consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ success: false, message: "Too many requests" });
        });
});
//Ip based rate limiting for sensitive endpoints
const sensitiveEndpointsLimiter = rateLimit({
    windowMs: 30 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip, // ✅ Use IP directly
    handler: (req, res) => {
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({ success: false, message: "Too many requests" });
    },
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
        skipFailedRequests: true,
    }),
});

//apply this sensitiveEndpointsLimiter to our routes



// Make UploadFolder Static
// Serve static files from the uploads folder
app.use(
    "/database/uploads",
    express.static(path.join(__dirname, "database/uploads"), {
        setHeaders: (res, filePath) => {
            // Allow cross-origin requests
            res.set("Access-Control-Allow-Origin", "*"); // or set your frontend URL here
            res.set("Access-Control-Allow-Methods", "GET");
            res.set("Access-Control-Allow-Headers", "Content-Type");
            res.set("Access-Control-Expose-Headers", "Content-Length"); // Expose content length for media

            // Set content type based on the file extension
            if (filePath.endsWith(".mp4")) {
                res.set("Content-Type", "video/mp4"); // Set correct content type for video
            } else if (
                filePath.endsWith(".jpeg") ||
                filePath.endsWith(".jpg") ||
                filePath.endsWith(".png")
            ) {
                res.set("Content-Type", "image/jpeg"); // Set content type for images
            }
        },
    })
);

// ==========================================
// Serve React Frontend Static Files
// ==========================================
// Serve built React app from public directory (production mode)
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir, {
    maxAge: "1d",
    etag: false,
    setHeaders: (res, filePath) => {
        // Set long cache for static assets with hash
        if (filePath.match(/\.(js|css|woff2?|ttf|otf|eot)$/)) {
            res.set("Cache-Control", "public, max-age=31536000, immutable");
        } else {
            res.set("Cache-Control", "public, max-age=0, must-revalidate");
        }
    }
}));

// Defining Routes & API
app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    logger.info(`Request IP, ${req.ip}`);
    // console.log(`Incoming request: ${req.method} ${req.url} from ${req.ip}`);

    next();
});

// Routes Defining
app.get("/", (req, res) => {
    res.send("Welcome to the API");
});

// ==========================================
// Health Check Endpoint (for Docker and monitoring)
// ==========================================
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development"
    });
});

// Remaining Routes
app.use("/api/auth",authRoute);
app.use("/api/order",orderRoute)
app.use("/api/payment",paymentRoute);
app.use("/api/service",serviceRoute);
app.use("/api/contact",contactRoute)
// app.use("/api/recommend",recommendRoute);
app.use("/api/recommendations", recommendationRoute);
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);
app.use("/api/openenv", openenvRoute);

// Broadcaster
app.set("io", io);
startTotpGeneration(io);
// kitchenMessage(io); // Commented out old kitchen socket logic
setupSocketIO(io);
kitchenSocketHandler(io); // Register new kitchen socket logic
setupOrderManagementSocket(io);

// ==========================================
// Serve React SPA - Catch all routes for client-side routing
// ==========================================
// This must be AFTER API routes but BEFORE error middleware
app.get("*", (req, res) => {
    // If it's not an API route, serve the React app
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "public", "index.html"), (err) => {
            if (err) {
                res.status(500).json({ success: false, message: "Failed to serve index.html" });
            }
        });
    }
});

// Error Catch
app.use(errorMiddleware);

// Server Starting with Connecting Database
connectToDatabase()
.then(async () => {
    console.log("Connected to MongoDB successfully");
    // Initialize the recommendation engine after DB connection
    await initializeRecommendationEngine();
    server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            logger.info(`Server running on port ${PORT}`);
            // logController(io);

            // BroadCasting 
            
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    });
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server shut down gracefully.");
        process.exit(0);
    });
});
