import React from "react";
import "./AdminProfile.css";

const AdminProfile = ({ user, onProfileUpdate }) => {
  return (
    <div className="admin-profile">
      <h2>Admin Profile</h2>
      <p>Welcome, {user?.firstName}!</p>
      <div className="profile-info">
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>
    </div>
  );
};

export default AdminProfile;
