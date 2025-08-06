const express = require("express");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { generateToken, authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth routes
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),

  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),

  body("phoneNumber")
    .optional()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please provide a valid phone number"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Please provide a valid date of birth"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer-not-to-say"])
    .withMessage("Please select a valid gender option"),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country name cannot exceed 100 characters"),

  body("agreeToTerms")
    .isBoolean()
    .custom((value) => {
      if (!value) {
        throw new Error("You must agree to the terms and conditions");
      }
      return true;
    }),

  body("subscribeToNewsletter")
    .optional()
    .isBoolean()
    .withMessage("Newsletter subscription must be a boolean value"),

  body("requestedRole")
    .optional()
    .isIn(["user", "job-seeker", "job-poster", "admin"])
    .withMessage("Invalid role requested"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),

  body("password").isLength({ min: 1 }).withMessage("Password is required"),

  body("requestedRole")
    .optional()
    .isIn(["user", "job-seeker", "job-poster", "admin"])
    .withMessage("Invalid role requested"),
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", authLimiter, registerValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      country,
      agreeToTerms,
      subscribeToNewsletter,
      requestedRole,
    } = req.body;

    // Choose the appropriate model based on database availability
    const UserModel = User;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email address",
      });
    }

    // Determine user role - admin requests need approval, others are direct
    let role = requestedRole || "job-seeker"; // Default to job-seeker

    if (requestedRole === "admin") {
      role = "job-seeker"; // Start as job-seeker, will be upgraded when approved
    }

    // Create new user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      country,
      role,
      agreeToTerms: agreeToTerms === "true" || agreeToTerms === true,
      subscribeToNewsletter:
        subscribeToNewsletter === "true" || subscribeToNewsletter === true,
    };

    // Add admin approval status if admin was requested
    if (requestedRole === "admin") {
      userData.adminApprovalStatus = "pending";
      userData.requestedRole = "admin";
    }

    const user = new UserModel(userData);

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      message:
        requestedRole === "admin"
          ? "User registered successfully. Admin access pending approval."
          : "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        role: user.role,
        adminApprovalStatus: user.adminApprovalStatus,
        requestedRole: user.requestedRole,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      // Duplicate key error
      return res.status(400).json({
        message: "Email address is already registered",
      });
    }

    res.status(500).json({
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authLimiter, loginValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { email, password, requestedRole } = req.body;

    // Choose the appropriate model based on database availability
    const UserModel = User;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Check role access
    if (requestedRole === "admin" && user.role !== "admin") {
      console.log(
        "❌ Login: User requesting admin role but doesn't have admin role:",
        user.email,
        user.role
      );
      return res.status(403).json({
        message:
          "Access denied. Admin privileges required or pending approval.",
      });
    }

    // Check admin approval status
    if (
      requestedRole === "admin" &&
      user.role === "admin" &&
      user.adminApprovalStatus !== "approved"
    ) {
      console.log(
        "❌ Login: Admin user but approval status not approved:",
        user.email,
        user.adminApprovalStatus
      );
      return res.status(403).json({
        message:
          "Access denied. Admin approval is still pending. Please contact an administrator.",
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        message:
          "Account is temporarily locked due to too many failed login attempts. Please try again later.",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated. Please contact support.",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();

      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
        role: user.role,
        adminApprovalStatus: user.adminApprovalStatus,
        requestedRole: user.requestedRole,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    res.json({
      message: "Profile retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      message: "Server error retrieving profile",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authMiddleware,
  [
    body("firstName").optional().trim().isLength({ min: 1, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 1, max: 50 }),
    body("phoneNumber")
      .optional()
      .matches(/^[+]?[1-9][\d]{0,15}$/),
    body("dateOfBirth").optional().isISO8601(),
    body("gender")
      .optional()
      .isIn(["male", "female", "other", "prefer-not-to-say"]),
    body("country").optional().trim().isLength({ max: 100 }),
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

      const allowedUpdates = [
        "firstName",
        "lastName",
        "phoneNumber",
        "dateOfBirth",
        "gender",
        "country",
      ];
      const updates = {};

      allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (updates.dateOfBirth) {
        updates.dateOfBirth = new Date(updates.dateOfBirth);
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        message: "Server error updating profile",
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", authMiddleware, (req, res) => {
  res.json({
    message: "Logout successful. Please remove the token from client storage.",
  });
});

// Get user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // User is already attached to req by authMiddleware
    const { password, loginAttempts, lockUntil, ...userProfile } =
      req.user.toObject();
    res.json({ user: userProfile });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
});

// Update user profile (protected route)
router.put(
  "/profile",
  authMiddleware,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),
    body("email")
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { firstName, lastName, email } = req.body;
      const userId = req.user._id || req.user.id;

      // Choose the appropriate model based on database availability
      const UserModel = User;

      // Check if email is being changed and if it's already taken
      if (email && email !== req.user.email) {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          return res.status(400).json({
            message: "Email already registered",
          });
        }
      }

      // Update user
      const updateData = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Remove sensitive information before sending response
      const { password, loginAttempts, lockUntil, ...userProfile } =
        updatedUser.toObject();

      res.json({
        message: "Profile updated successfully",
        user: userProfile,
      });
    } catch (error) {
      console.error("Profile update error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      res.status(500).json({
        message: "Server error while updating profile",
      });
    }
  }
);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        country: user.country,
        role: user.role,
        isVerified: user.isVerified,
        isActive: user.isActive,
        jobSeekerProfile: user.jobSeekerProfile,
        jobPosterProfile: user.jobPosterProfile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error while fetching profile" });
  }
});

// @route   PUT /api/auth/profile/job-seeker
// @desc    Update job seeker profile
// @access  Private (Job Seekers only)
router.put("/profile/job-seeker", authMiddleware, async (req, res) => {
  try {
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "job-seeker" && user.role !== "user") {
      return res.status(403).json({
        message: "Access denied. Job seeker role required.",
        currentRole: user.role,
        debug: "User role must be 'job-seeker' or 'user'",
      });
    }

    const {
      // Personal information
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      country,
      // Job seeker specific profile data
      jobSeekerProfile,
      // Legacy fields for backward compatibility
      skills,
      experience,
      education,
      preferredJobType,
      preferredWorkMode,
      expectedSalary,
      availability,
      portfolio,
    } = req.body;

    // Update personal information if provided
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (gender !== undefined) user.gender = gender;
    if (country !== undefined) user.country = country;

    // Initialize jobSeekerProfile if it doesn't exist
    if (!user.jobSeekerProfile) {
      user.jobSeekerProfile = {};
    }

    // Update job seeker profile with comprehensive data
    if (jobSeekerProfile) {
      // Professional information
      if (jobSeekerProfile.professionalTitle !== undefined) {
        user.jobSeekerProfile.professionalTitle =
          jobSeekerProfile.professionalTitle;
      }
      if (jobSeekerProfile.summary !== undefined) {
        user.jobSeekerProfile.summary = jobSeekerProfile.summary;
      }
      if (jobSeekerProfile.experience !== undefined) {
        // Validate experience enum
        const validExperiences = [
          "entry-level",
          "1-2 years",
          "3-5 years",
          "5-10 years",
          "10+ years",
        ];
        if (validExperiences.includes(jobSeekerProfile.experience)) {
          user.jobSeekerProfile.experience = jobSeekerProfile.experience;
        } else {
          console.log(
            `⚠️  Invalid experience value: ${jobSeekerProfile.experience}. Using default: entry-level`
          );
          user.jobSeekerProfile.experience = "entry-level";
        }
      }
      if (jobSeekerProfile.currentSalary !== undefined) {
        user.jobSeekerProfile.currentSalary = jobSeekerProfile.currentSalary;
      }
      if (jobSeekerProfile.expectedSalary !== undefined) {
        // Handle expectedSalary - convert string to proper object structure
        if (typeof jobSeekerProfile.expectedSalary === "string") {
          const salaryValue = parseInt(jobSeekerProfile.expectedSalary) || 0;
          user.jobSeekerProfile.expectedSalary = {
            min: salaryValue,
            max: salaryValue * 1.2, // 20% higher for max
            currency: "USD",
          };
          console.log(
            `🔄 Converted salary string "${jobSeekerProfile.expectedSalary}" to object:`,
            user.jobSeekerProfile.expectedSalary
          );
        } else if (typeof jobSeekerProfile.expectedSalary === "object") {
          user.jobSeekerProfile.expectedSalary =
            jobSeekerProfile.expectedSalary;
        }
      }
      if (jobSeekerProfile.availability !== undefined) {
        user.jobSeekerProfile.availability = jobSeekerProfile.availability;
      }

      // Location information
      if (jobSeekerProfile.location) {
        user.jobSeekerProfile.location = {
          ...user.jobSeekerProfile.location,
          ...jobSeekerProfile.location,
        };
      }

      // Social links
      if (jobSeekerProfile.socialLinks) {
        user.jobSeekerProfile.socialLinks = {
          ...user.jobSeekerProfile.socialLinks,
          ...jobSeekerProfile.socialLinks,
        };
      }

      // Education
      if (jobSeekerProfile.education !== undefined) {
        user.jobSeekerProfile.education = jobSeekerProfile.education;
      }

      // Work experience
      if (jobSeekerProfile.workExperience !== undefined) {
        user.jobSeekerProfile.workExperience = jobSeekerProfile.workExperience;
      }

      // Skills
      if (jobSeekerProfile.skills !== undefined) {
        user.jobSeekerProfile.skills = jobSeekerProfile.skills;
      }

      // Job preferences
      if (jobSeekerProfile.preferences) {
        user.jobSeekerProfile.preferences = {
          ...user.jobSeekerProfile.preferences,
          ...jobSeekerProfile.preferences,
        };
      }

      // Documents
      if (jobSeekerProfile.documents) {
        user.jobSeekerProfile.documents = {
          ...user.jobSeekerProfile.documents,
          ...jobSeekerProfile.documents,
        };
      }
    }

    // Handle legacy fields for backward compatibility
    if (skills !== undefined) {
      user.jobSeekerProfile.skills = skills;
    }
    if (experience !== undefined) {
      user.jobSeekerProfile.experience = experience;
    }
    if (education !== undefined) {
      user.jobSeekerProfile.education = education;
    }
    if (preferredJobType !== undefined) {
      if (!user.jobSeekerProfile.preferences) {
        user.jobSeekerProfile.preferences = {};
      }
      user.jobSeekerProfile.preferences.jobTypes = [preferredJobType];
    }
    if (preferredWorkMode !== undefined) {
      if (!user.jobSeekerProfile.preferences) {
        user.jobSeekerProfile.preferences = {};
      }
      user.jobSeekerProfile.preferences.workModes = [preferredWorkMode];
    }
    if (expectedSalary !== undefined) {
      // Handle legacy expectedSalary field (for backward compatibility)
      if (typeof expectedSalary === "string") {
        const salaryValue = parseInt(expectedSalary) || 0;
        user.jobSeekerProfile.expectedSalary = {
          min: salaryValue,
          max: salaryValue * 1.2,
          currency: "USD",
        };
      } else if (typeof expectedSalary === "object") {
        user.jobSeekerProfile.expectedSalary = expectedSalary;
      }
    }
    if (availability !== undefined) {
      user.jobSeekerProfile.availability = availability;
    }
    if (portfolio !== undefined) {
      if (!user.jobSeekerProfile.socialLinks) {
        user.jobSeekerProfile.socialLinks = {};
      }
      user.jobSeekerProfile.socialLinks.portfolio = portfolio;
    }

    // Validate before saving to catch any remaining issues
    try {
      await user.validate();
    } catch (validationError) {
      console.error(
        "❌ Validation error before save:",
        validationError.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationError.errors,
        details: validationError.message,
      });
    }

    await user.save();

    // Return the complete user object for frontend consistency
    const updatedUser = await UserModel.findById(req.user.id).select(
      "-password"
    );

    res.json({
      message: "Job seeker profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating job seeker profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// @route   PUT /api/auth/profile/job-poster
// @desc    Update job poster profile
// @access  Private (Job Posters only)
router.put("/profile/job-poster", authMiddleware, async (req, res) => {
  try {
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "job-poster") {
      return res
        .status(403)
        .json({ message: "Access denied. Job poster role required." });
    }

    const {
      companyName,
      companySize,
      industry,
      companyDescription,
      companyWebsite,
      jobTitle,
      department,
    } = req.body;

    // Update job poster profile
    user.jobPosterProfile = {
      ...user.jobPosterProfile,
      companyName: companyName || user.jobPosterProfile?.companyName,
      companySize: companySize || user.jobPosterProfile?.companySize,
      industry: industry || user.jobPosterProfile?.industry,
      companyDescription:
        companyDescription || user.jobPosterProfile?.companyDescription,
      companyWebsite: companyWebsite || user.jobPosterProfile?.companyWebsite,
      jobTitle: jobTitle || user.jobPosterProfile?.jobTitle,
      department: department || user.jobPosterProfile?.department,
    };

    await user.save();

    res.json({
      message: "Job poster profile updated successfully",
      profile: user.jobPosterProfile,
    });
  } catch (error) {
    console.error("Error updating job poster profile:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
});

// @route   PUT /api/auth/switch-role
// @desc    Switch user role between job-seeker and job-poster
// @access  Private
router.put("/switch-role", authMiddleware, async (req, res) => {
  try {
    const UserModel = User;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { newRole } = req.body;

    if (!newRole || !["job-seeker", "job-poster"].includes(newRole)) {
      return res.status(400).json({
        message: "Invalid role. Must be 'job-seeker' or 'job-poster'",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admins cannot switch to other roles",
      });
    }

    if (user.role === newRole) {
      return res.status(400).json({
        message: `User is already a ${newRole}`,
      });
    }

    user.role = newRole;
    await user.save();

    res.json({
      message: `Role switched to ${newRole} successfully`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error switching role:", error);
    res.status(500).json({ message: "Server error while switching role" });
  }
});

module.exports = router;

// Admin route to manage admin requests
router.get("/admin/pending-requests", authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }

    const UserModel = User;
    const pendingUsers = await UserModel.find({
      adminApprovalStatus: "pending",
    }).select("-password");

    res.json({
      message: "Pending admin requests retrieved successfully",
      requests: pendingUsers,
    });
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({
      message: "Server error while fetching pending requests",
    });
  }
});

router.put(
  "/admin/approve-request/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Admin privileges required.",
        });
      }

      const { action } = req.body; // "approve" or "reject"
      const UserModel = User;

      const targetUser = await UserModel.findById(req.params.userId);
      if (!targetUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (action === "approve") {
        targetUser.role = "admin";
        targetUser.adminApprovalStatus = "approved";
      } else if (action === "reject") {
        targetUser.adminApprovalStatus = "rejected";
      } else {
        return res.status(400).json({
          message: "Invalid action. Use 'approve' or 'reject'",
        });
      }

      await targetUser.save();

      res.json({
        message: `Admin request ${action}d successfully`,
        user: {
          id: targetUser._id,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          email: targetUser.email,
          role: targetUser.role,
          adminApprovalStatus: targetUser.adminApprovalStatus,
        },
      });
    } catch (error) {
      console.error("Error processing admin request:", error);
      res.status(500).json({
        message: "Server error while processing admin request",
      });
    }
  }
);
