import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Search } from "lucide-react";
import apiService from "../../services/api";
import { SectionLoader } from "../../components/Loader";
import SkillMatchScore from "../../components/SkillMatchScore/SkillMatchScore";
import "./Jobs.css";

const Jobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Check if user is admin and fetch profile data
  useEffect(() => {
    const userData = apiService.getUserData();
    setUser(userData);
    console.log("User data:", userData);

    // Fetch user profile if logged in as job seeker
    if (userData && userData.role === "job_seeker") {
      const fetchUserProfile = async () => {
        try {
          const response = await apiService.get("/auth/profile");
          console.log("Profile response:", response.data);
          setUserProfile(response.data.user); // Access the user property
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };
      fetchUserProfile();
    }
  }, []);

  // Show notification when returning from job creation
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    jobType: searchParams.get("jobType") || "",
    workMode: searchParams.get("workMode") || "",
    location: searchParams.get("location") || "",
    page: parseInt(searchParams.get("page")) || 1,
    limit: parseInt(searchParams.get("limit")) || 10,
  });

  const loadJobs = async (currentFilters = filters) => {
    try {
      setIsLoading(true);
      setError("");

      // Build query parameters
      const queryParams = {};
      if (currentFilters.search) queryParams.search = currentFilters.search;
      if (currentFilters.jobType) queryParams.jobType = currentFilters.jobType;
      if (currentFilters.workMode)
        queryParams.workMode = currentFilters.workMode;
      if (currentFilters.location)
        queryParams.location = currentFilters.location;
      queryParams.page = currentFilters.page;
      queryParams.limit = currentFilters.limit;

      const { data } = await apiService.getJobs(queryParams);
      setJobs(data.jobs);
      setPagination(data.pagination);

      // Update URL with current filters
      const newSearchParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== "" && value !== 1) {
          newSearchParams.set(key, value.toString());
        }
      });
      setSearchParams(newSearchParams);
    } catch (error) {
      console.error("Error loading jobs:", error);
      setError("Failed to load jobs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handleLimitChange = (newLimit) => {
    const newFilters = { ...filters, limit: parseInt(newLimit), page: 1 }; // Reset to page 1 when changing limit
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handleSearch = () => {
    const newFilters = { ...filters, page: 1 }; // Reset to page 1 when searching
    setFilters(newFilters);
    loadJobs(newFilters);
  };

  const handleJobClick = async (job) => {
    try {
      // Navigate to job details with job data to avoid immediate API call
      navigate(`/jobs/${job._id}`, {
        state: {
          job: job,
          fromJobsList: true,
        },
      });
    } catch (error) {
      console.error("Error viewing job:", error);
    }
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) {
      return "Salary not specified";
    }

    const currency = salary.currency || "USD";
    if (salary.min && salary.max) {
      return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    }
    if (salary.min) {
      return `${currency} ${salary.min.toLocaleString()}+`;
    }
    return `Up to ${currency} ${salary.max.toLocaleString()}`;
  };

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        <div className="jobs-header">
          <div className="jobs-header-content">
            <h1>Find Your Dream Job</h1>
            <p>Discover opportunities that match your skills and aspirations</p>
          </div>
          {user?.role === "admin" && (
            <button
              className="btn btn-create-job"
              onClick={() => navigate("/create-job")}
            >
              + Create New Job
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="jobs-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />
            <button
              onClick={handleSearch}
              className="search-button"
              type="button"
            >
              <Search size={16} />
              Search
            </button>
          </div>

          <div className="filters-row">
            <select
              value={filters.jobType}
              onChange={(e) => handleFilterChange("jobType", e.target.value)}
              className="filter-select"
            >
              <option value="">All Job Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>

            <select
              value={filters.workMode}
              onChange={(e) => handleFilterChange("workMode", e.target.value)}
              className="filter-select"
            >
              <option value="">All Work Modes</option>
              <option value="remote">Remote</option>
              <option value="on-site">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>

            <input
              type="text"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        {/* Jobs List */}
        <div className="jobs-content">
          <div className="jobs-content-area">
            {error && <div className="error-message">{error}</div>}

            {isLoading ? (
              <SectionLoader text="Loading jobs..." />
            ) : jobs.length === 0 ? (
              <div className="empty-state">
                <h3>No jobs found</h3>
                <p>Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <>
                <div className="jobs-list">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="job-card"
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="job-header">
                        <h3>{job.title}</h3>
                        <div className="job-meta">
                          <span className="company">{job.company}</span>
                          <span className="location">{job.location}</span>
                        </div>
                      </div>

                      <div className="job-details">
                        <div className="job-tags">
                          <span className={`tag job-type ${job.jobType}`}>
                            {job.jobType.replace("-", " ")}
                          </span>
                          <span className={`tag work-mode ${job.workMode}`}>
                            {job.workMode}
                          </span>
                          <span className={`tag experience ${job.experience}`}>
                            {job.experience} level
                          </span>
                        </div>

                        <p className="job-description">
                          {job.description.length > 200
                            ? `${job.description.substring(0, 200)}...`
                            : job.description}
                        </p>

                        <div className="job-skills">
                          <strong>Skills: </strong>
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="more-skills">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Show skill match score for logged-in job seekers */}
                        {user?.role === "job_seeker" && (
                          <div>
                            {console.log(
                              "User role check passed. User profile:",
                              userProfile
                            )}
                            {userProfile?.skills ? (
                              <div>
                                {console.log(
                                  "Rendering skill match for job:",
                                  job.title,
                                  "User skills:",
                                  userProfile.skills,
                                  "Job skills:",
                                  job.skills
                                )}
                                <SkillMatchScore
                                  jobSeekerSkills={userProfile.skills}
                                  jobRequiredSkills={job.skills}
                                  showDetails={false}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  padding: "10px",
                                  background: "#f0f0f0",
                                  borderRadius: "4px",
                                  margin: "10px 0",
                                }}
                              >
                                <small>
                                  Profile skills not loaded yet or no skills in
                                  profile
                                </small>
                              </div>
                            )}
                            {/* Test component with hardcoded data */}
                            <SkillMatchScore
                              jobSeekerSkills={["JavaScript", "React", "CSS"]}
                              jobRequiredSkills={job.skills}
                              showDetails={false}
                            />
                          </div>
                        )}

                        <div className="job-footer">
                          <div className="salary">
                            {formatSalary(job.salary)}
                          </div>
                          <div className="job-stats">
                            <span>👁 {job.views} views</span>
                            <span>📝 {job.applications} applications</span>
                          </div>
                          <div className="posted-date">
                            Posted{" "}
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {(pagination.pages > 1 || pagination.total > 0) && (
                  <div className="pagination">
                    <div className="pagination-controls">
                      <div className="jobs-per-page">
                        <label htmlFor="jobs-per-page-select">
                          Jobs per page:
                        </label>
                        <select
                          id="jobs-per-page-select"
                          value={filters.limit}
                          onChange={(e) => handleLimitChange(e.target.value)}
                          className="jobs-per-page-select"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                      </div>

                      {pagination.pages > 1 && (
                        <div className="pagination-navigation">
                          <button
                            className="pagination-btn"
                            onClick={() =>
                              handlePageChange(pagination.current - 1)
                            }
                            disabled={pagination.current === 1}
                          >
                            ← Previous
                          </button>

                          <div className="pagination-pages">
                            {Array.from(
                              { length: pagination.pages },
                              (_, i) => {
                                const page = i + 1;
                                const isCurrentPage =
                                  page === pagination.current;
                                const shouldShow =
                                  page === 1 ||
                                  page === pagination.pages ||
                                  (page >= pagination.current - 1 &&
                                    page <= pagination.current + 1);

                                if (
                                  !shouldShow &&
                                  page === 2 &&
                                  pagination.current > 4
                                ) {
                                  return (
                                    <span
                                      key="ellipsis-1"
                                      className="pagination-ellipsis"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                if (
                                  !shouldShow &&
                                  page === pagination.pages - 1 &&
                                  pagination.current < pagination.pages - 3
                                ) {
                                  return (
                                    <span
                                      key="ellipsis-2"
                                      className="pagination-ellipsis"
                                    >
                                      ...
                                    </span>
                                  );
                                }
                                if (!shouldShow) {
                                  return null;
                                }

                                return (
                                  <button
                                    key={page}
                                    className={`pagination-number ${
                                      isCurrentPage ? "active" : ""
                                    }`}
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </button>
                                );
                              }
                            )}
                          </div>

                          <button
                            className="pagination-btn"
                            onClick={() =>
                              handlePageChange(pagination.current + 1)
                            }
                            disabled={pagination.current === pagination.pages}
                          >
                            Next →
                          </button>
                        </div>
                      )}
                    </div>

                    {pagination.total > 0 && (
                      <div className="pagination-info">
                        Showing {(pagination.current - 1) * filters.limit + 1}-
                        {Math.min(
                          pagination.current * filters.limit,
                          pagination.total
                        )}{" "}
                        of {pagination.total} jobs
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
