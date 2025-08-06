import React from "react";
import "./JobSeekerProfile.css";

const JobSeekerProfile = ({ user, onUpdate, updating }) => {
  return (
    <div
      className="job-seeker-profile"
      style={{ padding: "20px", background: "#f5f5f5" }}
    >
      <h2 style={{ color: "#333", marginBottom: "20px" }}>
        Job Seeker Profile Test
      </h2>
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <p>
          <strong>User:</strong> {user?.firstName} {user?.lastName}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>
      <div
        style={{
          background: "red",
          padding: "20px",
          color: "white",
          borderRadius: "8px",
        }}
      >
        This should be visible! If you can see this, the component is rendering.
      </div>
    </div>
  );
};

export default JobSeekerProfile;
