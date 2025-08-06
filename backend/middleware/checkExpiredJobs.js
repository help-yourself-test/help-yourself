const Job = require("../models/Job");

// Middleware to check and update expired jobs
const checkExpiredJobs = async (req, res, next) => {
  try {
    // Only run this check occasionally to avoid performance issues
    // Check every 10th request or if explicitly requested
    const shouldCheck = Math.random() < 0.1 || req.query.checkExpiry === "true";

    if (shouldCheck) {
      await Job.updateExpiredJobs();
      console.log("✅ Checked and updated expired jobs");
    }

    next();
  } catch (error) {
    console.error("❌ Error checking expired jobs:", error);
    // Don't fail the request if expiry check fails
    next();
  }
};

module.exports = checkExpiredJobs;
