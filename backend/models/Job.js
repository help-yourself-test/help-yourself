const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Job title cannot be more than 100 characters"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    jobType: {
      type: String,
      required: [true, "Job type is required"],
      enum: ["full-time", "part-time", "contract", "freelance", "internship"],
      lowercase: true,
    },
    workMode: {
      type: String,
      required: [true, "Work mode is required"],
      enum: ["remote", "on-site", "hybrid"],
      lowercase: true,
    },
    experience: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ["entry", "junior", "mid", "senior", "lead", "executive"],
      lowercase: true,
    },
    salary: {
      min: {
        type: Number,
        min: [0, "Minimum salary cannot be negative"],
      },
      max: {
        type: Number,
        min: [0, "Maximum salary cannot be negative"],
      },
      currency: {
        type: String,
        default: "USD",
        maxlength: [3, "Currency code cannot be more than 3 characters"],
      },
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [5000, "Job description cannot be more than 5000 characters"],
    },
    requirements: {
      type: [String],
      required: [true, "Job requirements are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one requirement is required",
      },
    },
    skills: {
      type: [String],
      required: [true, "Skills are required"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one skill is required",
      },
    },
    benefits: {
      type: [String],
      default: [],
    },
    applicationDeadline: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > Date.now();
        },
        message: "Application deadline must be in the future",
      },
    },
    expiryDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v > Date.now();
        },
        message: "Expiry date must be in the future",
      },
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "expired", "draft", "paused"],
      default: "active",
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for formatted salary
jobSchema.virtual("formattedSalary").get(function () {
  if (!this.salary.min && !this.salary.max) return "Negotiable";
  if (this.salary.min && this.salary.max) {
    return `${
      this.salary.currency
    } ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
  }
  if (this.salary.min) {
    return `${this.salary.currency} ${this.salary.min.toLocaleString()}+`;
  }
  return `Up to ${this.salary.currency} ${this.salary.max.toLocaleString()}`;
});

// Index for search and performance
jobSchema.index({ title: "text", company: "text", description: "text" });
jobSchema.index({ location: 1, jobType: 1, workMode: 1 });
// Database indexes for performance
jobSchema.index({ isActive: 1, createdAt: -1 });
jobSchema.index({ createdBy: 1 });

// Instance method to increment views
jobSchema.methods.incrementViews = async function () {
  return this.constructor.updateOne({ _id: this._id }, { $inc: { views: 1 } });
};

// Instance method to increment applications
jobSchema.methods.incrementApplications = async function () {
  this.applications += 1;
  return this.save();
};

// Static method to find active jobs
jobSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isActive: true }).sort({
    createdAt: -1,
  });
};

// Static method to update expired jobs
jobSchema.statics.updateExpiredJobs = async function () {
  const now = new Date();
  const result = await this.updateMany(
    {
      expiryDate: { $lte: now },
      isExpired: false,
      status: "active",
    },
    {
      $set: {
        isExpired: true,
        status: "expired",
        isActive: false,
      },
    }
  );
  return result;
};

// Instance method to check if job is expired
jobSchema.methods.checkExpiry = function () {
  const now = new Date();
  if (this.expiryDate <= now && !this.isExpired) {
    this.isExpired = true;
    this.status = "expired";
    this.isActive = false;
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model("Job", jobSchema);
