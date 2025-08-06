const express = require("express");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Health check endpoint (no auth required)
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug endpoint to check current user status
router.get("/debug/current-user", authMiddleware, async (req, res) => {
  try {
    console.log("🔍 Debug: Current user check requested");
    console.log("User from token:", {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      adminApprovalStatus: req.user.adminApprovalStatus,
      isActive: req.user.isActive,
      isLocked: req.user.isLocked,
    });

    res.json({
      success: true,
      message: "Current user status",
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        adminApprovalStatus: req.user.adminApprovalStatus,
        isActive: req.user.isActive,
        isVerified: req.user.isVerified,
        isLocked: req.user.isLocked,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
      canAccessAdmin:
        req.user.role === "admin" &&
        req.user.adminApprovalStatus === "approved" &&
        req.user.isActive &&
        !req.user.isLocked,
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking user status",
      error: error.message,
    });
  }
});

module.exports = router;
