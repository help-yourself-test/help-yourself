const mongoose = require("mongoose");
const User = require("../models/User");
require("dotenv").config();

// MongoDB connection
const connectMongoDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://admin:admin@cluster0.rqrh7ny.mongodb.net/help-yourself-auth";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Function to check user status
const checkUserStatus = async (email) => {
  try {
    await connectMongoDB();

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "-password"
    );

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return;
    }

    console.log(`\n📋 User Status for: ${email}`);
    console.log("=" * 50);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log(
      `✅ Admin Approval Status: ${user.adminApprovalStatus || "not set"}`
    );
    console.log(`🔓 Is Active: ${user.isActive}`);
    console.log(`✅ Is Verified: ${user.isVerified}`);
    console.log(`🔒 Is Locked: ${user.isLocked || false}`);
    console.log(`📅 Created: ${user.createdAt}`);
    console.log(`🕐 Last Login: ${user.lastLogin || "never"}`);

    // Check login eligibility
    console.log("\n🔍 Login Eligibility Check:");
    console.log("=" * 30);

    if (!user.isActive) {
      console.log("❌ CANNOT LOGIN: Account is deactivated");
    } else if (user.isLocked) {
      console.log("❌ CANNOT LOGIN: Account is locked");
    } else if (
      user.role === "admin" &&
      user.adminApprovalStatus !== "approved"
    ) {
      console.log("❌ CANNOT LOGIN AS ADMIN: Admin approval is pending");
      console.log("   Approval Status:", user.adminApprovalStatus);
    } else if (
      user.role === "admin" &&
      user.adminApprovalStatus === "approved"
    ) {
      console.log("✅ CAN LOGIN AS ADMIN: All checks passed");
    } else if (user.role === "user") {
      console.log("✅ CAN LOGIN AS USER: All checks passed");
    }

    // MongoDB update commands
    console.log("\n🛠️  MongoDB Update Commands:");
    console.log("=" * 30);

    if (user.role === "admin" && user.adminApprovalStatus !== "approved") {
      console.log("To approve this admin user, run:");
      console.log(
        `db.users.updateOne({email: "${user.email}"}, {$set: {adminApprovalStatus: "approved"}})`
      );
    }

    if (!user.isActive) {
      console.log("To activate this user, run:");
      console.log(
        `db.users.updateOne({email: "${user.email}"}, {$set: {isActive: true}})`
      );
    }
  } catch (error) {
    console.error("❌ Error checking user status:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

// Command line usage
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node checkUser.js <email>");
    console.log("Example: node checkUser.js admin@example.com");
    process.exit(1);
  }

  checkUserStatus(email);
}

module.exports = { checkUserStatus };
