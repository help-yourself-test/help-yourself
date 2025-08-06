const express = require("express");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

// ===== ADMIN USER MANAGEMENT ROUTES =====

// Get user status by email (admin only)
router.get(
  "/user-status/:email",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { email } = req.params;

      const user = await User.findOne({ email: email.toLowerCase() }).select(
        "-password"
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `User not found: ${email}`,
        });
      }

      // Check login eligibility
      let canLogin = true;
      let loginIssues = [];

      if (!user.isActive) {
        canLogin = false;
        loginIssues.push("Account is deactivated");
      }

      if (user.isLocked) {
        canLogin = false;
        loginIssues.push("Account is locked");
      }

      if (user.role === "admin" && user.adminApprovalStatus !== "approved") {
        canLogin = false;
        loginIssues.push(
          `Admin approval is ${user.adminApprovalStatus || "pending"}`
        );
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          adminApprovalStatus: user.adminApprovalStatus,
          isActive: user.isActive,
          isVerified: user.isVerified,
          isLocked: user.isLocked,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
        loginStatus: {
          canLogin,
          issues: loginIssues,
        },
        actions: {
          approve:
            user.role === "admin" && user.adminApprovalStatus !== "approved"
              ? `PUT /api/admin/approve/${user._id}`
              : null,
          activate: !user.isActive
            ? `PUT /api/admin/activate/${user._id}`
            : null,
        },
      });
    } catch (error) {
      console.error("Error checking user status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check user status",
      });
    }
  }
);

// Get all users (admin only)
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password -__v").sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// Get pending admin approvals
router.get(
  "/pending-approvals",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const pendingUsers = await User.find(
        { adminApprovalStatus: "pending" },
        "-password -__v"
      ).sort({ createdAt: -1 });

      res.json({
        success: true,
        pendingApprovals: pendingUsers,
        count: pendingUsers.length,
      });
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending approvals",
      });
    }
  }
);

// Approve admin user
router.post(
  "/approve/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update user to admin
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: "admin",
          adminApprovalStatus: "approved",
        },
        { new: true, select: "-password -__v" }
      );

      res.json({
        success: true,
        message: `${updatedUser.firstName} ${updatedUser.lastName} has been approved as an admin`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error approving admin:", error);
      res.status(500).json({
        success: false,
        message: "Failed to approve admin",
      });
    }
  }
);

// Reject admin approval
router.post(
  "/reject/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Update user status to rejected
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: "user",
          adminApprovalStatus: "rejected",
        },
        { new: true, select: "-password -__v" }
      );

      res.json({
        success: true,
        message: `${updatedUser.firstName} ${updatedUser.lastName}'s admin request has been rejected`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error rejecting admin:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reject admin request",
      });
    }
  }
);

// Update user role (admin only)
router.put(
  "/users/:userId/role",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role. Must be 'user' or 'admin'",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: role,
          adminApprovalStatus: role === "admin" ? "approved" : null,
        },
        { new: true, select: "-password -__v" }
      );

      res.json({
        success: true,
        message: `User role updated to ${role}`,
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user role",
      });
    }
  }
);

// Delete user (admin only)
router.delete(
  "/users/:userId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Prevent admin from deleting themselves
      if (userId === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      await User.findByIdAndDelete(userId);

      res.json({
        success: true,
        message: `User ${user.firstName} ${user.lastName} has been deleted`,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  }
);

module.exports = router;
