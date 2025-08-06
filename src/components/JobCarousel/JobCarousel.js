import React from "react";
import Carousel from "../Carousel/Carousel";
import "./JobCarousel.css";

const JobCarousel = ({
  jobs,
  onJobClick,
  onEditJob,
  onDeleteJob,
  isAdmin = false,
  formatSalary,
  className = "",
  ...carouselProps
}) => {
  const defaultProps = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoPlay: false,
    showDots: true,
    showArrows: true,
    infinite: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    ...carouselProps,
  };

  return (
    <Carousel className={`job-carousel ${className}`} {...defaultProps}>
      {jobs.map((job) => (
        <div key={job._id} className="job-carousel-item">
          <div
            className={`job-card ${
              isAdmin ? "admin-job-card" : "public-job-card"
            }`}
            onClick={() => onJobClick && onJobClick(job)}
          >
            <div className="job-content">
              <h3 className="job-title">{job.title}</h3>
              <p className="job-company">{job.company}</p>
              <p className="job-location">{job.location}</p>

              <div className="job-tags">
                <span className="tag job-type">
                  {job.jobType?.replace("-", " ") || "Full Time"}
                </span>
                <span className="tag work-mode">
                  {job.workMode || "On-site"}
                </span>
                {isAdmin && (
                  <span
                    className={`tag status ${
                      job.isActive ? "active" : "inactive"
                    }`}
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                )}
              </div>

              {formatSalary && job.salary && (
                <p className="job-salary">{formatSalary(job.salary)}</p>
              )}

              {isAdmin && (
                <div className="job-stats">
                  <span>Views: {job.views || 0}</span>
                  <span>Applications: {job.applications || 0}</span>
                  <span>
                    Created: {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {isAdmin && (onEditJob || onDeleteJob) && (
              <div className="job-actions">
                {onEditJob && (
                  <button
                    className="btn btn-edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditJob(job);
                    }}
                  >
                    Edit
                  </button>
                )}
                {onDeleteJob && (
                  <button
                    className="btn btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteJob(job._id);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default JobCarousel;
