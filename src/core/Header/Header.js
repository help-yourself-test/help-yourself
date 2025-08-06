import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../services/api";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const isAuth = apiService.isAuthenticated();
      const user = apiService.getUserData();

      setIsAuthenticated(isAuth);
      setUserData(user);
    };

    checkAuth();

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUserData(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <h1>Your App</h1>
          </Link>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/jobs" className="nav-link">
                Jobs
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link">
                Services
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="welcome-text">
                Welcome, {userData?.firstName || "User"}!
              </span>
              {userData?.role === "admin" && (
                <>
                  <button
                    className="btn-create-job"
                    onClick={() => navigate("/create-job")}
                  >
                    Create Job
                  </button>
                  <button
                    className="btn-admin"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </button>
                </>
              )}
              <button className="btn-profile" onClick={handleProfileClick}>
                Profile
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <>
              <button className="btn-login" onClick={handleLoginClick}>
                Login
              </button>
              <button className="btn-signup" onClick={handleSignupClick}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
