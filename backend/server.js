const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");
const debugRoutes = require("./routes/debug");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
app.use(helmet());
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options("*", cors(corsOptions));

// MongoDB connection with timeout
let usingMockDatabase = false;

// Use MongoDB Atlas URI from environment variables
const mongoUri =
  process.env.MONGODB_URI || "mongodb://localhost:27017/help-yourself-auth";

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout for Atlas
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log(
      "📊 Database: " +
        (mongoUri.includes("mongodb+srv") ? "MongoDB Atlas" : "Local MongoDB")
    );
    usingMockDatabase = false;
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("🔄 Falling back to mock in-memory database for demonstration");
    usingMockDatabase = true;
  });

app.use((req, res, next) => {
  req.usingMockDatabase = usingMockDatabase;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/debug", debugRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    message: "CORS test successful",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Server is running on port " + PORT);
  console.log("🌍 Environment: " + (process.env.NODE_ENV || "development"));
  console.log(
    "🔗 Health check: http://localhost:" + PORT + "/api/debug/health"
  );
  console.log("📡 API base URL: http://localhost:" + PORT + "/api");
});
