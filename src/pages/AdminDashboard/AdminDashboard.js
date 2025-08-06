import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import Form from "../../components/Form";
import { PageLoader } from "../../components/Loader";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [user, setUser] = useState(null);

  // Check if we're on the post-job route
  React.useEffect(() => {
    if (window.location.pathname === "/post-job") {
      setShowJobForm(true);
    }
  }, []);

  // Check admin access and load data
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          navigate("/login");
          return;
        }

        // Get user profile to check admin role
        const { data: profileData } = await apiService.getProfile();
        setUser(profileData.user);

        if (profileData.user.role !== "admin") {
          navigate("/profile"); // Redirect non-admin users to profile
          return;
        }

        // Load admin jobs
        await loadJobs();

        // Load users and pending approvals if admin
        await loadUsers();
        await loadPendingApprovals();
      } catch (error) {
        console.error("Error checking admin access:", error);
        if (error.message.includes("401")) {
          navigate("/login");
        } else {
          setError("Failed to verify admin access");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();

    // Add event listeners to refresh data when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && apiService.isAuthenticated()) {
        loadJobs();
        loadUsers();
        loadPendingApprovals();
      }
    };

    const handleFocus = () => {
      if (apiService.isAuthenticated()) {
        loadJobs();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [navigate]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const { data } = await apiService.getAdminJobs();
      setJobs(data.jobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setError("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data } = await apiService.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      // Don't set error here as it might not be critical
    }
  };

  const loadPendingApprovals = async () => {
    try {
      const { data } = await apiService.getPendingApprovals();
      setPendingApprovals(data.pendingApprovals || []);
    } catch (error) {
      console.error("Error loading pending approvals:", error);
      // Don't set error here as it might not be critical
    }
  };

  // Job form configuration
  const jobFormData = [
    {
      type: "input",
      inputType: "text",
      name: "title",
      label: "Job Title",
      placeholder: "Enter job title",
      required: true,
      value: editingJob?.title || "",
    },
    {
      type: "input",
      inputType: "text",
      name: "company",
      label: "Company",
      placeholder: "Enter company name",
      required: true,
      value: editingJob?.company || "",
    },
    {
      type: "input",
      inputType: "text",
      name: "location",
      label: "Location",
      placeholder: "Enter job location",
      required: true,
      value: editingJob?.location || "",
    },
    {
      type: "select",
      name: "jobType",
      label: "Job Type",
      required: true,
      value: editingJob?.jobType || "full-time",
      options: [
        { value: "full-time", label: "Full Time" },
        { value: "part-time", label: "Part Time" },
        { value: "contract", label: "Contract" },
        { value: "freelance", label: "Freelance" },
        { value: "internship", label: "Internship" },
      ],
    },
    {
      type: "select",
      name: "workMode",
      label: "Work Mode",
      required: true,
      value: editingJob?.workMode || "remote",
      options: [
        { value: "remote", label: "Remote" },
        { value: "on-site", label: "On-site" },
        { value: "hybrid", label: "Hybrid" },
      ],
    },
    {
      type: "select",
      name: "experience",
      label: "Experience Level",
      required: true,
      value: editingJob?.experience || "entry",
      options: [
        { value: "entry", label: "Entry Level" },
        { value: "junior", label: "Junior" },
        { value: "mid", label: "Mid Level" },
        { value: "senior", label: "Senior" },
        { value: "lead", label: "Lead" },
        { value: "executive", label: "Executive" },
      ],
    },
    {
      type: "input",
      inputType: "number",
      name: "salaryMin",
      label: "Minimum Salary",
      placeholder: "Enter minimum salary",
      value: editingJob?.salary?.min || "",
    },
    {
      type: "input",
      inputType: "number",
      name: "salaryMax",
      label: "Maximum Salary",
      placeholder: "Enter maximum salary",
      value: editingJob?.salary?.max || "",
    },
    {
      type: "input",
      inputType: "text",
      name: "currency",
      label: "Currency",
      placeholder: "USD",
      value: editingJob?.salary?.currency || "USD",
    },
    {
      type: "textarea",
      name: "description",
      label: "Job Description",
      placeholder: "Enter detailed job description",
      required: true,
      rows: 6,
      value: editingJob?.description || "",
    },
    {
      type: "textarea",
      name: "requirements",
      label: "Requirements (one per line)",
      placeholder: "Enter job requirements, one per line",
      required: true,
      rows: 4,
      value: editingJob?.requirements?.join("\\n") || "",
    },
    {
      type: "textarea",
      name: "skills",
      label: "Skills (one per line)",
      placeholder: "Enter required skills, one per line",
      required: true,
      rows: 4,
      value: editingJob?.skills?.join("\\n") || "",
    },
    {
      type: "textarea",
      name: "benefits",
      label: "Benefits (one per line)",
      placeholder: "Enter job benefits, one per line",
      rows: 3,
      value: editingJob?.benefits?.join("\\n") || "",
    },
    {
      type: "input",
      inputType: "email",
      name: "contactEmail",
      label: "Contact Email",
      placeholder: "Enter contact email",
      required: true,
      value: editingJob?.contactEmail || "",
    },
    {
      type: "input",
      inputType: "date",
      name: "applicationDeadline",
      label: "Application Deadline",
      value: editingJob?.applicationDeadline
        ? new Date(editingJob.applicationDeadline).toISOString().split("T")[0]
        : "",
    },
    {
      type: "checkbox",
      name: "isActive",
      label: "Active",
      checked: editingJob?.isActive !== false,
    },
  ];

  const handleJobSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Process form data
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        workMode: formData.workMode,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements
          .split("\\n")
          .filter((req) => req.trim()),
        skills: formData.skills.split("\\n").filter((skill) => skill.trim()),
        benefits: formData.benefits
          ? formData.benefits.split("\\n").filter((benefit) => benefit.trim())
          : [],
        contactEmail: formData.contactEmail,
        applicationDeadline: formData.applicationDeadline || null,
        isActive: formData.isActive !== false,
        salary: {
          min: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
          max: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
          currency: formData.currency || "USD",
        },
      };

      if (editingJob) {
        await apiService.updateJob(editingJob._id, jobData);
        setSuccess("Job updated successfully!");
      } else {
        await apiService.createJob(jobData);
        setSuccess("Job created successfully!");
      }

      setShowJobForm(false);
      setEditingJob(null);
      await loadJobs();
    } catch (error) {
      console.error("Error saving job:", error);
      setError(error.message || "Failed to save job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      setIsLoading(true);
      await apiService.deleteJob(jobId);
      setSuccess("Job deleted successfully!");
      await loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      setError("Failed to delete job");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelForm = () => {
    setShowJobForm(false);
    setEditingJob(null);
    setError("");
    setSuccess("");
  };

  const handleApproveAdmin = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to approve ${userName} as an admin?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await apiService.approveAdmin(userId);
      setSuccess(`${userName} has been approved as an admin successfully!`);
      await loadPendingApprovals();
      await loadUsers();
    } catch (error) {
      console.error("Error approving admin:", error);
      setError(error.message || "Failed to approve admin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAdmin = async (userId, userName) => {
    if (
      !window.confirm(
        `Are you sure you want to reject ${userName}'s admin request?`
      )
    ) {
      return;
    }

    try {
      setIsLoading(true);
      await apiService.rejectAdmin(userId);
      setSuccess(`${userName}'s admin request has been rejected.`);
      await loadPendingApprovals();
      await loadUsers();
    } catch (error) {
      console.error("Error rejecting admin:", error);
      setError(error.message || "Failed to reject admin request");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !user) {
    return <PageLoader text="Loading admin dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>
          Welcome, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          Manage Jobs
        </button>
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          User Management
          {pendingApprovals.length > 0 && (
            <span className="notification-badge">
              {pendingApprovals.length}
            </span>
          )}
        </button>
        <button
          className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "jobs" && (
          <div className="jobs-management">
            <div className="jobs-header">
              <h2>Job Management</h2>
              <div className="jobs-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/create-job")}
                  disabled={isLoading}
                >
                  Create New Job
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowJobForm(true)}
                  disabled={isLoading}
                >
                  Quick Job Form
                </button>
              </div>
            </div>

            {showJobForm && (
              <div className="job-form-modal">
                <div className="job-form-content">
                  <div className="form-header">
                    <h3>{editingJob ? "Edit Job" : "Create New Job"}</h3>
                    <button className="close-button" onClick={handleCancelForm}>
                      ×
                    </button>
                  </div>

                  <Form
                    fields={jobFormData}
                    onSubmit={handleJobSubmit}
                    submitText={editingJob ? "Update Job" : "Create Job"}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="jobs-list">
              {isLoading ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  <p>Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <p>No jobs found. Create your first job posting!</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="job-card">
                    <div className="job-info">
                      <h3>{job.title}</h3>
                      <p className="company">{job.company}</p>
                      <p className="location">{job.location}</p>
                      <div className="job-meta">
                        <span className={`job-type ${job.jobType}`}>
                          {job.jobType.replace("-", " ")}
                        </span>
                        <span className={`work-mode ${job.workMode}`}>
                          {job.workMode}
                        </span>
                        <span
                          className={`status ${
                            job.isActive ? "active" : "inactive"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="job-stats">
                        <span>Views: {job.views}</span>
                        <span>Applications: {job.applications}</span>
                        <span>
                          Created:{" "}
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="job-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEditJob(job)}
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteJob(job._id)}
                        disabled={isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="user-management">
            <h2>User Management</h2>

            {pendingApprovals.length > 0 && (
              <div className="pending-approvals">
                <h3>Pending Admin Approvals ({pendingApprovals.length})</h3>
                <div className="approvals-list">
                  {pendingApprovals.map((user) => (
                    <div key={user._id} className="approval-card">
                      <div className="user-info">
                        <h4>
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="email">{user.email}</p>
                        <p className="phone">
                          {user.phoneNumber || "No phone provided"}
                        </p>
                        <p className="country">
                          {user.country || "No country provided"}
                        </p>
                        <div className="user-meta">
                          <span>
                            Requested:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="approval-actions">
                        <button
                          className="btn btn-approve"
                          onClick={() =>
                            handleApproveAdmin(
                              user._id,
                              `${user.firstName} ${user.lastName}`
                            )
                          }
                          disabled={isLoading}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-reject"
                          onClick={() =>
                            handleRejectAdmin(
                              user._id,
                              `${user.firstName} ${user.lastName}`
                            )
                          }
                          disabled={isLoading}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="all-users">
              <h3>All Users ({users.length})</h3>
              <div className="users-list">
                {isLoading ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="empty-state">
                    <p>No users found.</p>
                  </div>
                ) : (
                  users.map((user) => (
                    <div key={user._id} className="user-card">
                      <div className="user-info">
                        <h4>
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className="email">{user.email}</p>
                        <p className="phone">
                          {user.phoneNumber || "No phone provided"}
                        </p>
                        <div className="user-meta">
                          <span className={`role ${user.role}`}>
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                          <span
                            className={`status ${
                              user.adminApprovalStatus || "approved"
                            }`}
                          >
                            {user.adminApprovalStatus || "Approved"}
                          </span>
                          <span>
                            Joined:{" "}
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="user-actions">
                        {user.role !== "admin" &&
                          user.adminApprovalStatus !== "pending" && (
                            <button
                              className="btn btn-promote"
                              onClick={() =>
                                handleApproveAdmin(
                                  user._id,
                                  `${user.firstName} ${user.lastName}`
                                )
                              }
                              disabled={isLoading}
                            >
                              Promote to Admin
                            </button>
                          )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics">
            <h2>Analytics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Jobs</h3>
                <p className="stat-number">{jobs.length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Jobs</h3>
                <p className="stat-number">
                  {jobs.filter((job) => job.isActive).length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Views</h3>
                <p className="stat-number">
                  {jobs.reduce((total, job) => total + job.views, 0)}
                </p>
              </div>
              <div className="stat-card">
                <h3>Total Applications</h3>
                <p className="stat-number">
                  {jobs.reduce((total, job) => total + job.applications, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
