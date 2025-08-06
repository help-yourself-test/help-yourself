const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided or invalid format. Access denied.",
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        message: "No token provided. Access denied.",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    );

    // Get user from token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "Token is valid but user not found. Access denied.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        message: "User account is deactivated. Access denied.",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Access denied.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please login again.",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Server error during authentication",
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without user
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    );
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "help-yourself-auth",
    audience: "help-yourself-users",
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || "fallback-secret-key");
};

// Admin middleware (requires user to be admin)
const adminMiddleware = (req, res, next) => {
  try {
    console.log("🔍 Auth middleware admin check:", {
      userExists: !!req.user,
      userRole: req.user?.role,
      userEmail: req.user?.email,
      adminApprovalStatus: req.user?.adminApprovalStatus,
      isActive: req.user?.isActive,
    });

    if (!req.user) {
      console.log("❌ Auth middleware: No user found");
      return res.status(401).json({
        message: "Authentication required. Access denied.",
      });
    }

    if (req.user.role !== "admin") {
      console.log("❌ Auth middleware: User role is not admin");
      return res.status(403).json({
        message: "Admin access required. Access denied.",
      });
    }

    if (req.user.adminApprovalStatus !== "approved") {
      console.log(
        "❌ Auth middleware: Admin approval status is not approved:",
        req.user.adminApprovalStatus
      );
      return res.status(403).json({
        message:
          "Access denied. Admin privileges required or pending approval.",
      });
    }

    console.log("✅ Auth middleware: Admin access granted");
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      message: "Server error during admin verification",
    });
  }
};

module.exports = {
  authMiddleware,
  optionalAuth,
  adminMiddleware,
  generateToken,
  verifyToken,
};
