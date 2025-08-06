import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { MapPin, Briefcase, Home, User, AlertTriangle } from "lucide-react";
import apiService from "../../services/api";
import { SectionLoader } from "../../components/Loader";
import Carousel from "../../components/Carousel";
import SkillMatchScore from "../../components/SkillMatchScore/SkillMatchScore";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Update document title when job loads
  useEffect(() => {
    if (job) {
      document.title = `${job.title} at ${job.company} - Help Yourself`;
    }
    return () => {
      document.title = "Help Yourself";
    };
  }, [job]);

  // Fetch user profile data
  useEffect(() => {
    const userData = apiService.getUserData();
    setUser(userData);

    // Fetch user profile if logged in as job seeker
    if (userData && userData.role === "job_seeker") {
      const fetchUserProfile = async () => {
        try {
          const response = await apiService.get("/auth/profile");
          setUserProfile(response.data.user); // Access the user property
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
        }
      };
      fetchUserProfile();
    }
  }, []);

  // Check if job data was passed via navigation state
  const stateJob = location.state?.job;

  useEffect(() => {
    const fetchJobDetails = async () => {
      // If we have job data from navigation state, use it initially
      if (stateJob && stateJob._id === id) {
        setJob(stateJob);
        setLoading(false);

        // Still fetch fresh data in background for any updates
        fetchJobFromAPI();
        return;
      }

      // Otherwise fetch from API
      await fetchJobFromAPI();
    };

    const fetchJobFromAPI = async () => {
      try {
        setLoading(true);

        // Fetch job details
        const response = await apiService.getJob(id);
        setJob(response.data.job);
        setError("");

        // Track job view (views are automatically incremented in backend)
        try {
          await apiService.trackJobView(id);
        } catch (viewError) {
          // Don't fail the whole request if view tracking fails
          console.warn("Failed to track job view:", viewError);
        }
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(error.message || "Failed to load job details");
        toast.error(`Failed to load job details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobDetails();
    } else {
      setError("Invalid job ID");
      setLoading(false);
    }
  }, [id, stateJob]);

  const handleApplyJob = () => {
    // Handle job application logic here
    if (job.contactEmail) {
      window.location.href = `mailto:${job.contactEmail}?subject=Application for ${job.title}&body=Dear Hiring Manager,%0D%0A%0D%0AI am interested in applying for the ${job.title} position at ${job.company}.%0D%0A%0D%0AThank you for your consideration.%0D%0A%0D%0ABest regards`;
    } else {
      toast.info(
        "Please contact the company directly to apply for this position"
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return "Not specified";

    const formatAmount = (amount) => {
      return new Intl.NumberFormat("en-US").format(amount);
    };

    if (salary.min && salary.max) {
      return `${salary.currency || "USD"} ${formatAmount(
        salary.min
      )} - ${formatAmount(salary.max)}`;
    } else if (salary.min) {
      return `${salary.currency || "USD"} ${formatAmount(salary.min)}+`;
    } else if (salary.max) {
      return `Up to ${salary.currency || "USD"} ${formatAmount(salary.max)}`;
    }
  };

  if (loading) {
    return (
      <div className="job-details-container">
        <SectionLoader text="Loading job details..." />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-container">
        <div className="error-container">
          <h2>Error Loading Job</h2>
          <p>{error || "Job not found"}</p>
          <button onClick={() => navigate("/jobs")} className="back-btn">
            ← Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <button onClick={() => navigate("/jobs")} className="back-btn">
          ← Back to Jobs
        </button>

        <div className="job-title-section">
          <h1 className="job-title">{job.title}</h1>
          <h2 className="company-name">{job.company}</h2>
          <div className="job-meta">
            <span className="location">
              <MapPin size={16} /> {job.location}
            </span>
            <span className="job-type">
              <Briefcase size={16} /> {job.jobType}
            </span>
            <span className="work-mode">
              <Home size={16} /> {job.workMode}
            </span>
            <span className="experience">
              <User size={16} /> {job.experience} level
            </span>
          </div>
        </div>

        {job.isUrgent && (
          <div className="urgent-badge">
            <AlertTriangle size={16} /> Urgent
          </div>
        )}
      </div>

      <div className="job-details-content">
        <div className="main-content">
          <section className="job-section">
            <h3>Job Description</h3>
            <div className="job-description">
              {job.description?.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <section className="job-section">
              <h3>Key Responsibilities</h3>
              <ul className="responsibilities-list">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index}>{responsibility}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="job-section">
            <h3>Requirements</h3>
            <ul className="requirements-list">
              {job.requirements.map((requirement, index) => (
                <li key={index}>{requirement}</li>
              ))}
            </ul>
          </section>

          {job.skills && job.skills.length > 0 && (
            <section className="job-section">
              <h3>Required Skills</h3>

              {/* Desktop: Regular flex layout */}
              <div className="skills-tags desktop-only">
                {job.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Mobile: Carousel for better UX when many skills */}
              {job.skills.length > 4 && (
                <div className="mobile-tablet-only">
                  <Carousel
                    slidesToShow={3}
                    slidesToScroll={2}
                    autoPlay={false}
                    showDots={true}
                    showArrows={true}
                    infinite={false}
                    className="skills-carousel external-arrows"
                    responsive={[
                      {
                        breakpoint: 768,
                        settings: {
                          slidesToShow: 2,
                          slidesToScroll: 1,
                        },
                      },
                      {
                        breakpoint: 480,
                        settings: {
                          slidesToShow: 1,
                          slidesToScroll: 1,
                        },
                      },
                    ]}
                  >
                    {job.skills.map((skill, index) => (
                      <div key={index} className="skill-wrapper">
                        <span className="skill-tag">{skill}</span>
                      </div>
                    ))}
                  </Carousel>
                </div>
              )}

              {/* Mobile: Regular layout for few skills */}
              {job.skills.length <= 4 && (
                <div className="skills-tags mobile-tablet-only">
                  {job.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Show skill match score for logged-in job seekers */}
          {user?.role === "job_seeker" &&
            userProfile?.skills &&
            job?.skills && (
              <section className="job-section">
                <h3>Skill Match Analysis</h3>
                <SkillMatchScore
                  jobSeekerSkills={userProfile.skills}
                  jobRequiredSkills={job.skills}
                  showDetails={true}
                />
              </section>
            )}

          {job.benefits && job.benefits.length > 0 && (
            <section className="job-section">
              <h3>Benefits & Perks</h3>
              <ul className="benefits-list">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </section>
          )}

          {job.applicationInstructions && (
            <section className="job-section">
              <h3>Application Instructions</h3>
              <div className="application-instructions">
                {job.applicationInstructions
                  .split("\n")
                  .map((instruction, index) => (
                    <p key={index}>{instruction}</p>
                  ))}
              </div>
            </section>
          )}
        </div>

        <div className="sidebar-content">
          <div className="job-info-card">
            <h3>Job Information</h3>
            <div className="info-item">
              <strong>Salary:</strong>
              <span>{formatSalary(job.salary)}</span>
            </div>
            <div className="info-item">
              <strong>Department:</strong>
              <span>{job.department || "Not specified"}</span>
            </div>
            <div className="info-item">
              <strong>Positions Available:</strong>
              <span>{job.numberOfPositions || 1}</span>
            </div>
            <div className="info-item">
              <strong>Education Level:</strong>
              <span>{job.educationLevel || "Not specified"}</span>
            </div>
            <div className="info-item">
              <strong>Posted Date:</strong>
              <span>{formatDate(job.postedDate || job.createdAt)}</span>
            </div>
            <div className="info-item">
              <strong>Application Deadline:</strong>
              <span className="deadline">
                {formatDate(job.applicationDeadline)}
              </span>
            </div>
            {job.expiryDate && (
              <div className="info-item">
                <strong>Expires:</strong>
                <span>{formatDate(job.expiryDate)}</span>
              </div>
            )}
          </div>

          {job.companyWebsite && (
            <div className="company-info-card">
              <h3>Company Information</h3>
              <div className="info-item">
                <strong>Website:</strong>
                <a
                  href={job.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Company Website
                </a>
              </div>
            </div>
          )}

          <div className="contact-info-card">
            <h3>Contact Information</h3>
            {job.contactEmail && (
              <div className="info-item">
                <strong>Email:</strong>
                <a href={`mailto:${job.contactEmail}`}>{job.contactEmail}</a>
              </div>
            )}
            {job.contactPhone && (
              <div className="info-item">
                <strong>Phone:</strong>
                <a href={`tel:${job.contactPhone}`}>{job.contactPhone}</a>
              </div>
            )}
          </div>

          <div className="apply-section">
            <button onClick={handleApplyJob} className="apply-btn">
              Apply for this Job
            </button>
            <p className="apply-note">
              Click to send an email application or contact the company
              directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
