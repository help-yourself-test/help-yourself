const express = require("express");
const { body, validationResult, param } = require("express-validator");
const { authMiddleware } = require("../middleware/auth");
const checkExpiredJobs = require("../middleware/checkExpiredJobs");
const Job = require("../models/Job");

const router = express.Router();

// Middleware to check if user is admin or job-poster (Job Poster acts as admin for jobs)
const adminMiddleware = (req, res, next) => {
  console.log("🔍 Admin middleware check:", {
    userRole: req.user?.role,
    userEmail: req.user?.email,
    adminApprovalStatus: req.user?.adminApprovalStatus,
    isActive: req.user?.isActive,
  });

  // Allow both 'admin' and 'job-poster' roles
  if (req.user.role !== "admin" && req.user.role !== "job-poster") {
    console.log("❌ Admin middleware: User role is not admin or job-poster");
    return res.status(403).json({
      message: "Access denied. Admin or Job Poster privileges required.",
    });
  }

  // Only require admin approval for actual admins
  if (
    req.user.role === "admin" &&
    req.user.adminApprovalStatus !== "approved"
  ) {
    console.log(
      "❌ Admin middleware: Admin approval status is not approved:",
      req.user.adminApprovalStatus
    );
    return res.status(403).json({
      message: "Access denied. Admin privileges required or pending approval.",
    });
  }

  console.log("✅ Admin middleware: Access granted");
  next();
};

// Get all jobs (public route)
router.get("/", checkExpiredJobs, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      jobType,
      workMode,
      location,
      search,
    } = req.query;
    const JobModel = Job;

    let filter = { isActive: true };

    // Add filters
    if (jobType) filter.jobType = jobType.toLowerCase();
    if (workMode) filter.workMode = workMode.toLowerCase();
    if (location) filter.location = new RegExp(location, "i");

    // Handle mock database differently
    if (req.usingMockDatabase) {
      // For mock database, just return empty array for now
      const jobs = [];
      const total = 0;

      res.json({
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalJobs: total,
          limit: parseInt(limit),
        },
      });
      return;
    }

    let query = JobModel.find(filter);

    // Add text search if provided
    if (search) {
      query = JobModel.find({
        ...filter,
        $text: { $search: search },
      });
    }

    const jobs = await query
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await JobModel.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({
      message: "Server error while fetching jobs",
    });
  }
});

// Get single job by ID (public route)
router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Job ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const JobModel = Job;
      const job = await JobModel.findById(req.params.id);

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      // Increment views using direct update to avoid validation
      await JobModel.updateOne({ _id: req.params.id }, { $inc: { views: 1 } });

      res.json({ job });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({
        message: "Server error while fetching job",
      });
    }
  }
);

// Create new job (admin only)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Job title is required")
      .isLength({ max: 100 })
      .withMessage("Job title cannot exceed 100 characters"),
    body("company")
      .trim()
      .notEmpty()
      .withMessage("Company name is required")
      .isLength({ max: 100 })
      .withMessage("Company name cannot exceed 100 characters"),
    body("location")
      .trim()
      .notEmpty()
      .withMessage("Location is required")
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
    body("jobType")
      .isIn(["full-time", "part-time", "contract", "freelance", "internship"])
      .withMessage("Invalid job type"),
    body("workMode")
      .isIn(["remote", "on-site", "hybrid"])
      .withMessage("Invalid work mode"),
    body("experience")
      .isIn(["entry", "junior", "mid", "senior", "lead", "executive"])
      .withMessage("Invalid experience level"),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Job description is required")
      .isLength({ max: 5000 })
      .withMessage("Job description cannot exceed 5000 characters"),
    body("requirements")
      .isArray({ min: 1 })
      .withMessage("At least one requirement is required"),
    body("skills")
      .isArray({ min: 1 })
      .withMessage("At least one skill is required"),
    body("contactEmail")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid contact email is required"),
    body("salary.min")
      .optional()
      .isNumeric()
      .withMessage("Minimum salary must be a number"),
    body("salary.max")
      .optional()
      .isNumeric()
      .withMessage("Maximum salary must be a number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const JobModel = Job;

      const jobData = {
        ...req.body,
        createdBy: req.user._id || req.user.id,
      };

      const job = await JobModel.create(jobData);

      res.status(201).json({
        message: "Job created successfully",
        job,
      });
    } catch (error) {
      console.error("Error creating job:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({
        message: "Server error while creating job",
      });
    }
  }
);

// Update job (admin only)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [
    param("id").notEmpty().withMessage("Job ID is required"),
    body("title")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Job title cannot exceed 100 characters"),
    body("company")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Company name cannot exceed 100 characters"),
    body("location")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
    body("jobType")
      .optional()
      .isIn(["full-time", "part-time", "contract", "freelance", "internship"])
      .withMessage("Invalid job type"),
    body("workMode")
      .optional()
      .isIn(["remote", "on-site", "hybrid"])
      .withMessage("Invalid work mode"),
    body("experience")
      .optional()
      .isIn(["entry", "junior", "mid", "senior", "lead", "executive"])
      .withMessage("Invalid experience level"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage("Job description cannot exceed 5000 characters"),
    body("contactEmail")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid contact email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const JobModel = Job;

      const job = await JobModel.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      res.json({
        message: "Job updated successfully",
        job,
      });
    } catch (error) {
      console.error("Error updating job:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({
        message: "Server error while updating job",
      });
    }
  }
);

// Delete job (admin only)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  [param("id").notEmpty().withMessage("Job ID is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const JobModel = Job;

      const job = await JobModel.findByIdAndDelete(req.params.id);

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      res.json({
        message: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({
        message: "Server error while deleting job",
      });
    }
  }
);

// Get admin jobs (admin only)
router.get(
  "/admin/my-jobs",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const JobModel = Job;

      const filter = { createdBy: req.user._id || req.user.id };

      const jobs = await JobModel.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await JobModel.countDocuments(filter);

      res.json({
        jobs,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      });
    } catch (error) {
      console.error("Error fetching admin jobs:", error);
      res.status(500).json({
        message: "Server error while fetching jobs",
      });
    }
  }
);

module.exports = router;
