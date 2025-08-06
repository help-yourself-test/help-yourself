import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiService from "../../services/api";
import AdminProfile from "../../components/AdminProfile/AdminProfile";
import JobSeekerProfile from "../../components/JobSeekerProfile/JobSeekerProfile";
import JobPosterProfile from "../../components/JobPosterProfile/JobPosterProfile";
import { SectionLoader } from "../../components/Loader";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!apiService.isAuthenticated()) {
          navigate("/login");
          return;
        }

        const { data } = await apiService.getProfile();
        setUser(data.user);
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          toast.error("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleProfileUpdate = async (updatedData) => {
    setUpdating(true);
    try {
      const response = await apiService.updateProfile(updatedData);
      setUser(response.data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <SectionLoader />;
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <h2>Profile not found</h2>
          <p>Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  const renderProfileComponent = () => {
    switch (user.role) {
      case "admin":
        return (
          <AdminProfile
            user={user}
            onUpdate={handleProfileUpdate}
            updating={updating}
          />
        );
      case "job_seeker":
        return (
          <JobSeekerProfile
            user={user}
            onUpdate={handleProfileUpdate}
            updating={updating}
          />
        );
      case "job_poster":
        return (
          <JobPosterProfile
            user={user}
            onUpdate={handleProfileUpdate}
            updating={updating}
          />
        );
      default:
        return (
          <div className="error-message">
            <h2>Unknown user role</h2>
            <p>Your account role is not recognized.</p>
          </div>
        );
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p className="profile-subtitle">
            Manage your account information and preferences
          </p>
        </div>

        <div className="profile-body">{renderProfileComponent()}</div>
      </div>
    </div>
  );
};

export default Profile;
