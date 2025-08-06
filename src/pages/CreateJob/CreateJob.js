import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./CreateJob.css";

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user is admin
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData.role || userData.role !== "admin") {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    workMode: "On-site",
    salaryMin: "",
    salaryMax: "",
    currency: "USD",
    experienceLevel: "Entry Level",
    department: "",
    description: "",
    requirements: "",
    responsibilities: "",
    skills: "",
    benefits: "",
    applicationDeadline: "",
    expiryDate: "",
    contactEmail: "",
    contactPhone: "",
    applicationInstructions: "",
    companyWebsite: "",
    isUrgent: false,
    numberOfPositions: 1,
    educationLevel: "Bachelor's Degree",
    languageRequirements: "",
    certificationRequirements: "",
    category: "Technology",
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setJobData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    // Required field validation with specific field names
    const requiredFields = {
      title: "Job Title",
      company: "Company Name",
      location: "Job Location",
      description: "Job Description",
      requirements: "Job Requirements",
      applicationDeadline: "Application Deadline",
    };

    const missingFields = [];
    Object.keys(requiredFields).forEach((field) => {
      if (!jobData[field] || !jobData[field].toString().trim()) {
        missingFields.push(requiredFields[field]);
      }
    });

    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Validate title length
    if (jobData.title && jobData.title.length < 5) {
      errors.push("Job title must be at least 5 characters long");
    }
    if (jobData.title && jobData.title.length > 100) {
      errors.push("Job title must be less than 100 characters");
    }

    // Validate company name
    if (jobData.company && jobData.company.length < 2) {
      errors.push("Company name must be at least 2 characters long");
    }

    // Validate description length
    if (jobData.description && jobData.description.length < 50) {
      errors.push("Job description must be at least 50 characters long");
    }

    // Validate email format if provided
    if (jobData.contactEmail && jobData.contactEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(jobData.contactEmail)) {
        errors.push("Contact email must be a valid email address");
      }
    }

    // Validate phone number format if provided
    if (jobData.contactPhone && jobData.contactPhone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(jobData.contactPhone.replace(/[\s\-()]/g, ""))) {
        errors.push("Contact phone must be a valid phone number");
      }
    }

    // Validate website URL if provided
    if (jobData.companyWebsite && jobData.companyWebsite.trim()) {
      try {
        new URL(jobData.companyWebsite);
      } catch {
        errors.push(
          "Company website must be a valid URL (include http:// or https://)"
        );
      }
    }

    // Validate salary range
    if (jobData.salaryMin && jobData.salaryMax) {
      const minSalary = parseFloat(jobData.salaryMin);
      const maxSalary = parseFloat(jobData.salaryMax);

      if (isNaN(minSalary) || minSalary < 0) {
        errors.push("Minimum salary must be a valid positive number");
      }
      if (isNaN(maxSalary) || maxSalary < 0) {
        errors.push("Maximum salary must be a valid positive number");
      }
      if (!isNaN(minSalary) && !isNaN(maxSalary) && minSalary >= maxSalary) {
        errors.push("Maximum salary must be greater than minimum salary");
      }
    }

    // Validate number of positions
    if (
      jobData.numberOfPositions &&
      (parseInt(jobData.numberOfPositions) < 1 ||
        parseInt(jobData.numberOfPositions) > 100)
    ) {
      errors.push("Number of positions must be between 1 and 100");
    }

    // Validate application deadline
    if (jobData.applicationDeadline) {
      const deadlineDate = new Date(jobData.applicationDeadline);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (isNaN(deadlineDate.getTime())) {
        errors.push("Application deadline must be a valid date");
      } else if (deadlineDate <= today) {
        errors.push("Application deadline must be at least tomorrow or later");
      } else if (
        deadlineDate >
        new Date(today.getFullYear() + 2, today.getMonth(), today.getDate())
      ) {
        errors.push(
          "Application deadline cannot be more than 2 years in the future"
        );
      }
    }

    // Validate expiry date if provided
    if (jobData.expiryDate) {
      const expiryDate = new Date(jobData.expiryDate);
      const deadlineDate = new Date(jobData.applicationDeadline);

      if (isNaN(expiryDate.getTime())) {
        errors.push("Expiry date must be a valid date");
      } else if (jobData.applicationDeadline && expiryDate <= deadlineDate) {
        errors.push(
          "Expiry date must be at least one day after application deadline"
        );
      }
    }

    // If there are validation errors, show them
    if (errors.length > 0) {
      const errorMsg = `Validation Failed:\n${errors
        .map((error, index) => `${index + 1}. ${error}`)
        .join("\n")}`;
      setError(errorMsg);

      // Show individual error messages as toasts
      errors.forEach((error, index) => {
        setTimeout(() => {
          toast.error(`${index + 1}. ${error}`, {
            position: "top-right",
            autoClose: 6000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }, index * 500); // Stagger the error messages
      });

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Show loading toast
    const loadingToastId = toast.loading("Creating job posting...", {
      position: "top-right",
    });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        const errorMsg = "Authentication required. Please login again.";
        setError(errorMsg);
        toast.error(errorMsg);
        navigate("/login");
        return;
      }

      // Calculate expiry date if not provided (30 days after application deadline)
      const expiryDate = jobData.expiryDate
        ? new Date(jobData.expiryDate).toISOString()
        : (() => {
            const date = new Date(jobData.applicationDeadline);
            date.setDate(date.getDate() + 30);
            return date.toISOString();
          })();

      // Prepare job data for submission with proper value transformations
      const jobTypeMapping = {
        "Full-time": "full-time",
        "Part-time": "part-time",
        Contract: "contract",
        Freelance: "freelance",
        Internship: "internship",
      };

      const workModeMapping = {
        Remote: "remote",
        "On-site": "on-site",
        Hybrid: "hybrid",
      };

      const experienceLevelMapping = {
        "Entry Level": "entry",
        "Junior Level": "junior",
        "Mid Level": "mid",
        "Senior Level": "senior",
        "Lead Level": "lead",
        "Executive Level": "executive",
      };

      const jobPayload = {
        ...jobData,
        // Transform values to match backend expectations
        jobType:
          jobTypeMapping[jobData.jobType] || jobData.jobType.toLowerCase(),
        workMode:
          workModeMapping[jobData.workMode] || jobData.workMode.toLowerCase(),
        experience:
          experienceLevelMapping[jobData.experienceLevel] ||
          jobData.experienceLevel.toLowerCase(),
        skills: jobData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill),
        requirements: jobData.requirements
          .split("\n")
          .filter((req) => req.trim()),
        responsibilities: jobData.responsibilities
          .split("\n")
          .filter((resp) => resp.trim()),
        benefits: jobData.benefits
          .split("\n")
          .filter((benefit) => benefit.trim()),
        languageRequirements: jobData.languageRequirements
          .split(",")
          .map((lang) => lang.trim())
          .filter((lang) => lang),
        certificationRequirements: jobData.certificationRequirements
          .split(",")
          .map((cert) => cert.trim())
          .filter((cert) => cert),
        salary: {
          min: parseFloat(jobData.salaryMin) || 0,
          max: parseFloat(jobData.salaryMax) || 0,
          currency: jobData.currency,
        },
        postedBy: JSON.parse(localStorage.getItem("userData") || "{}")._id,
        postedDate: new Date().toISOString(),
        expiryDate: expiryDate,
        status: "active",
        isExpired: false,
      };

      // Remove frontend-specific fields from payload
      delete jobPayload.salaryMin;
      delete jobPayload.salaryMax;
      delete jobPayload.currency;
      delete jobPayload.experienceLevel;

      // Debug: Log the payload being sent
      console.log("Job payload being sent:", {
        jobType: jobPayload.jobType,
        workMode: jobPayload.workMode,
        experience: jobPayload.experience,
        title: jobPayload.title,
        originalValues: {
          jobType: jobData.jobType,
          workMode: jobData.workMode,
          experienceLevel: jobData.experienceLevel,
        },
      });
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(jobPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle detailed validation errors from backend
        if (data.errors && Array.isArray(data.errors)) {
          throw new Error(
            `Validation failed: ${JSON.stringify({ errors: data.errors })}`
          );
        } else {
          throw new Error(data.message || "Failed to create job posting");
        }
      }

      // Show success notification
      const successMsg = `Job "${jobData.title}" created successfully!`;
      setSuccess(successMsg);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.success(successMsg, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Redirect to jobs list after a short delay to show the notification
      setTimeout(() => {
        navigate("/jobs", {
          state: {
            message: "Job created successfully!",
            jobId: data.job?._id,
          },
        });
      }, 1500);
    } catch (error) {
      console.error("Error creating job:", error);

      let errorMsg = "Failed to create job posting. Please try again.";

      // Check if it's a validation error from the backend
      if (error.message && error.message.includes("Validation failed")) {
        // Try to parse the response for detailed errors
        try {
          const errorResponse = JSON.parse(
            error.message.replace("Validation failed: ", "")
          );
          if (errorResponse.errors && Array.isArray(errorResponse.errors)) {
            const backendErrors = errorResponse.errors.map(
              (err, index) => `${index + 1}. ${err.msg || err.message || err}`
            );
            errorMsg = `Server Validation Failed:\n${backendErrors.join("\n")}`;
          } else if (
            typeof errorResponse === "object" &&
            errorResponse.message
          ) {
            errorMsg = `Server Error: ${errorResponse.message}`;
          }
        } catch (parseError) {
          // If parsing fails, just use the original error message
          errorMsg = error.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setError(errorMsg);

      // Dismiss loading toast and show error
      toast.dismiss(loadingToastId);

      // Show errors as individual toasts if it's validation errors
      if (
        errorMsg.includes("Validation Failed:") ||
        errorMsg.includes("Server Validation Failed:")
      ) {
        const errorLines = errorMsg.split("\n").slice(1);
        errorLines.forEach((errorLine, index) => {
          setTimeout(() => {
            toast.error(errorLine, {
              position: "top-right",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
          }, index * 500);
        });
      } else {
        toast.error(errorMsg, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJobData({
      title: "",
      company: "",
      location: "",
      jobType: "Full-time",
      workMode: "On-site",
      salaryMin: "",
      salaryMax: "",
      currency: "USD",
      experienceLevel: "Entry Level",
      department: "",
      description: "",
      requirements: "",
      responsibilities: "",
      skills: "",
      benefits: "",
      applicationDeadline: "",
      expiryDate: "",
      contactEmail: "",
      contactPhone: "",
      applicationInstructions: "",
      companyWebsite: "",
      isUrgent: false,
      numberOfPositions: 1,
      educationLevel: "Bachelor's Degree",
      languageRequirements: "",
      certificationRequirements: "",
      category: "Technology",
    });
    setError("");
    setSuccess("");

    // Show reset confirmation
    toast.info("Form has been reset", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="create-job-container">
      <div className="create-job-header">
        <h1>Create New Job Posting</h1>
        <p>Fill in the details below to create a comprehensive job posting</p>
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="back-btn"
        >
          ← Back to Admin Dashboard
        </button>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-header">
            <strong>⚠️ Validation Failed</strong>
          </div>
          <div className="error-content">
            {error.includes("Validation Failed:") ? (
              <ul className="error-list">
                {error
                  .split("\n")
                  .slice(1)
                  .map((errorLine, index) => (
                    <li key={index} className="error-item">
                      {errorLine}
                    </li>
                  ))}
              </ul>
            ) : (
              <p>{error}</p>
            )}
          </div>
        </div>
      )}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="create-job-form">
        {/* Basic Information Section */}
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Job Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={jobData.company}
                onChange={handleInputChange}
                placeholder="e.g., Tech Solutions Inc."
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={jobData.department}
                onChange={handleInputChange}
                placeholder="e.g., Engineering, Marketing"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={jobData.location}
                onChange={handleInputChange}
                placeholder="e.g., New York, NY or Remote"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={jobData.category}
                onChange={handleInputChange}
              >
                <option value="Technology">Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Design">Design</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Operations">Operations</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Legal">Legal</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="numberOfPositions">Number of Positions</label>
              <input
                type="number"
                id="numberOfPositions"
                name="numberOfPositions"
                value={jobData.numberOfPositions}
                onChange={handleInputChange}
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        {/* Job Details Section */}
        <div className="form-section">
          <h2>Job Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="jobType">Job Type</label>
              <select
                id="jobType"
                name="jobType"
                value={jobData.jobType}
                onChange={handleInputChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="workMode">Work Mode</label>
              <select
                id="workMode"
                name="workMode"
                value={jobData.workMode}
                onChange={handleInputChange}
              >
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="experienceLevel">Experience Level</label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={jobData.experienceLevel}
                onChange={handleInputChange}
              >
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Junior Level">Junior Level (1-3 years)</option>
                <option value="Mid Level">Mid Level (3-5 years)</option>
                <option value="Senior Level">Senior Level (5-8 years)</option>
                <option value="Lead Level">Lead Level (8-12 years)</option>
                <option value="Executive Level">
                  Executive Level (12+ years)
                </option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="educationLevel">Education Level</label>
              <select
                id="educationLevel"
                name="educationLevel"
                value={jobData.educationLevel}
                onChange={handleInputChange}
              >
                <option value="High School">High School</option>
                <option value="Associate Degree">Associate Degree</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctoral Degree">Doctoral Degree</option>
                <option value="Professional Certification">
                  Professional Certification
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary Information Section */}
        <div className="form-section">
          <h2>Salary Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salaryMin">Minimum Salary</label>
              <input
                type="number"
                id="salaryMin"
                name="salaryMin"
                value={jobData.salaryMin}
                onChange={handleInputChange}
                placeholder="50000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="salaryMax">Maximum Salary</label>
              <input
                type="number"
                id="salaryMax"
                name="salaryMax"
                value={jobData.salaryMax}
                onChange={handleInputChange}
                placeholder="80000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={jobData.currency}
                onChange={handleInputChange}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
                <option value="AUD">AUD (A$)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Description Section */}
        <div className="form-section">
          <h2>Job Description</h2>

          <div className="form-group full-width">
            <label htmlFor="description">Job Description *</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleInputChange}
              placeholder="Provide a detailed description of the job role, what the candidate will be doing, and what makes this position exciting..."
              rows="6"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="requirements">Requirements * (One per line)</label>
            <textarea
              id="requirements"
              name="requirements"
              value={jobData.requirements}
              onChange={handleInputChange}
              placeholder="Bachelor's degree in Computer Science&#10;3+ years of React experience&#10;Strong problem-solving skills&#10;Experience with Git and version control"
              rows="5"
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="responsibilities">
              Responsibilities (One per line)
            </label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              value={jobData.responsibilities}
              onChange={handleInputChange}
              placeholder="Develop and maintain React applications&#10;Collaborate with design and backend teams&#10;Write clean, maintainable code&#10;Participate in code reviews"
              rows="5"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="skills">Required Skills (Comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={jobData.skills}
              onChange={handleInputChange}
              placeholder="React, JavaScript, CSS, HTML, Node.js, MongoDB"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="benefits">Benefits (One per line)</label>
            <textarea
              id="benefits"
              name="benefits"
              value={jobData.benefits}
              onChange={handleInputChange}
              placeholder="Health insurance&#10;401(k) matching&#10;Flexible work hours&#10;Professional development budget&#10;Remote work options"
              rows="4"
            />
          </div>
        </div>

        {/* Additional Requirements Section */}
        <div className="form-section">
          <h2>Additional Requirements</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="languageRequirements">
                Language Requirements (Comma separated)
              </label>
              <input
                type="text"
                id="languageRequirements"
                name="languageRequirements"
                value={jobData.languageRequirements}
                onChange={handleInputChange}
                placeholder="English (Fluent), Spanish (Conversational)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="certificationRequirements">
                Certifications (Comma separated)
              </label>
              <input
                type="text"
                id="certificationRequirements"
                name="certificationRequirements"
                value={jobData.certificationRequirements}
                onChange={handleInputChange}
                placeholder="AWS Certified, Scrum Master, PMP"
              />
            </div>
          </div>
        </div>

        {/* Dates and Contact Section */}
        <div className="form-section">
          <h2>Dates and Contact Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="applicationDeadline">
                Application Deadline *
              </label>
              <input
                type="date"
                id="applicationDeadline"
                name="applicationDeadline"
                value={jobData.applicationDeadline}
                onChange={handleInputChange}
                min={today}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Job Expiry Date (Optional)</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={jobData.expiryDate}
                onChange={handleInputChange}
                min={jobData.applicationDeadline || today}
              />
              <small>
                If not set, will automatically expire 30 days after application
                deadline
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactEmail">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={jobData.contactEmail}
                onChange={handleInputChange}
                placeholder="hr@company.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={jobData.contactPhone}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="companyWebsite">Company Website</label>
            <input
              type="url"
              id="companyWebsite"
              name="companyWebsite"
              value={jobData.companyWebsite}
              onChange={handleInputChange}
              placeholder="https://www.company.com"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="applicationInstructions">
              Application Instructions
            </label>
            <textarea
              id="applicationInstructions"
              name="applicationInstructions"
              value={jobData.applicationInstructions}
              onChange={handleInputChange}
              placeholder="Please submit your resume and cover letter. Include portfolio links for design positions..."
              rows="3"
            />
          </div>
        </div>

        {/* Job Flags Section */}
        <div className="form-section">
          <h2>Job Flags</h2>

          <div className="checkbox-row">
            <div className="form-group checkbox-group">
              <label htmlFor="isUrgent" className="checkbox-label">
                <input
                  type="checkbox"
                  id="isUrgent"
                  name="isUrgent"
                  checked={jobData.isUrgent}
                  onChange={handleInputChange}
                />
                Urgent Hiring
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            className="reset-btn"
            disabled={loading}
          >
            Reset Form
          </button>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating Job..." : "Create Job Posting"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJob;
