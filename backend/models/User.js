const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    phoneNumber: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      lowercase: true,
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, "Country cannot be more than 100 characters"],
    },
    role: {
      type: String,
      enum: ["user", "job-seeker", "job-poster", "admin"],
      default: "user",
    },
    requestedRole: {
      type: String,
      enum: ["user", "job-seeker", "job-poster", "admin"],
    },
    adminApprovalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
    },
    agreeToTerms: {
      type: Boolean,
      required: [true, "You must agree to the terms and conditions"],
    },
    subscribeToNewsletter: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Job Seeker specific fields
    jobSeekerProfile: {
      skills: [
        {
          type: String,
          trim: true,
        },
      ],
      experience: {
        type: String,
        enum: [
          "entry-level",
          "1-2 years",
          "3-5 years",
          "5-10 years",
          "10+ years",
        ],
      },
      education: {
        level: {
          type: String,
          enum: [
            "high-school",
            "associate",
            "bachelor",
            "master",
            "doctorate",
            "other",
          ],
        },
        field: {
          type: String,
          trim: true,
        },
        institution: {
          type: String,
          trim: true,
        },
        graduationYear: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear() + 10,
        },
      },
      resume: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      preferredJobType: [
        {
          type: String,
          enum: [
            "full-time",
            "part-time",
            "contract",
            "internship",
            "freelance",
          ],
        },
      ],
      preferredWorkMode: [
        {
          type: String,
          enum: ["remote", "hybrid", "on-site"],
        },
      ],
      expectedSalary: {
        min: {
          type: Number,
          min: 0,
        },
        max: {
          type: Number,
          min: 0,
        },
        currency: {
          type: String,
          default: "USD",
        },
      },
      availability: {
        type: String,
        enum: ["immediate", "2-weeks", "1-month", "3-months", "not-looking"],
        default: "immediate",
      },
      portfolio: {
        website: String,
        linkedin: String,
        github: String,
        other: String,
      },
    },
    // Job Poster specific fields
    jobPosterProfile: {
      companyName: {
        type: String,
        trim: true,
        maxlength: [100, "Company name cannot be more than 100 characters"],
      },
      companySize: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      },
      industry: {
        type: String,
        trim: true,
        maxlength: [100, "Industry cannot be more than 100 characters"],
      },
      companyDescription: {
        type: String,
        trim: true,
        maxlength: [
          1000,
          "Company description cannot be more than 1000 characters",
        ],
      },
      companyWebsite: {
        type: String,
        trim: true,
      },
      companyLogo: {
        fileName: String,
        fileUrl: String,
        uploadedAt: Date,
      },
      jobTitle: {
        type: String,
        trim: true,
        maxlength: [100, "Job title cannot be more than 100 characters"],
      },
      department: {
        type: String,
        trim: true,
        maxlength: [100, "Department cannot be more than 100 characters"],
      },
      isVerifiedEmployer: {
        type: Boolean,
        default: false,
      },
      verificationDocuments: [
        {
          fileName: String,
          fileUrl: String,
          uploadedAt: Date,
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
        },
      ],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = async function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we have reached max attempts and it's not currently locked, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Index for email (unique)
userSchema.index({ email: 1 });

// Index for performance on queries
userSchema.index({ isActive: 1, isVerified: 1 });

module.exports = mongoose.model("User", userSchema);
