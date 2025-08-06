import React from "react";
import { Routes } from "react-router-dom";
import { publicRoutes } from "./components/PublicRoutes";
import { authRoutes } from "./components/AuthRoutes";
import { userRoutes } from "./components/UserRoutes";
import { adminRoutes } from "./components/AdminRoutes";

// Main route configuration
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {publicRoutes}

      {/* Authentication Routes */}
      {authRoutes}

      {/* User Routes */}
      {userRoutes}

      {/* Admin Routes */}
      {adminRoutes}
    </Routes>
  );
};

export default AppRoutes;

// Export route constants and configurations for use in other components
export { ROUTES, ROUTE_CONFIG } from "./routeConfig";
export {
  ProtectedRoute,
  PublicRoute,
  AdminRoute,
  routeUtils,
} from "./routeGuards";
export { publicRoutes } from "./components/PublicRoutes";
export { authRoutes } from "./components/AuthRoutes";
export { userRoutes } from "./components/UserRoutes";
export { adminRoutes } from "./components/AdminRoutes";
