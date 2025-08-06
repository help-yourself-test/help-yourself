import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "./routeConfig";

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  return !!token;
};

// Check if user is admin
const isAdmin = () => {
  const userData = localStorage.getItem("userData");
  if (!userData) return false;

  try {
    const user = JSON.parse(userData);
    return user.role === "admin";
  } catch {
    return false;
  }
};

// Protected Route Component - requires authentication
export const ProtectedRoute = ({ children, requiresAdmin = false }) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Redirect to login with the current location
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (requiresAdmin && !isAdmin()) {
    // Redirect to profile if user is not admin
    return <Navigate to={ROUTES.PROFILE} replace />;
  }

  return children;
};

// Public Route Component - redirects to dashboard if already authenticated
export const PublicRoute = ({ children, redirectIfAuthenticated = false }) => {
  if (redirectIfAuthenticated && isAuthenticated()) {
    if (isAdmin()) {
      return <Navigate to={ROUTES.ADMIN} replace />;
    } else {
      return <Navigate to={ROUTES.JOBS} replace />;
    }
  }

  return children;
};

// Admin Route Component - requires admin privileges
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requiresAdmin={true}>{children}</ProtectedRoute>;
};

// Route utilities
export const routeUtils = {
  isAuthenticated,
  isAdmin,
  getDefaultRoute: () => {
    if (!isAuthenticated()) return ROUTES.HOME;
    return isAdmin() ? ROUTES.ADMIN : ROUTES.JOBS;
  },
  getNavRoutes: () => {
    // Return routes that should be visible in navigation based on user state
    const baseRoutes = [
      ROUTES.HOME,
      ROUTES.JOBS, // Jobs are now public
      ROUTES.ABOUT,
      ROUTES.SERVICES,
      ROUTES.CONTACT,
    ];

    if (isAuthenticated()) {
      if (isAdmin()) {
        baseRoutes.push(ROUTES.ADMIN);
      }
    }

    return baseRoutes;
  },
  getJobDetailsRoute: (jobId) => {
    return ROUTES.JOB_DETAILS.replace(":id", jobId);
  },
};
