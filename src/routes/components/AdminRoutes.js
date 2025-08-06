import React from "react";
import { Route } from "react-router-dom";
import { CreateJob } from "../../pages";
import AdminDashboard from "../../pages/AdminDashboard";
import { AdminRoute } from "../routeGuards";
import { ROUTES } from "../routeConfig";

// Admin route definitions (require authentication and admin role)
export const adminRoutes = [
  <Route
    key="admin"
    path={ROUTES.ADMIN}
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />,
  <Route
    key="post-job"
    path={ROUTES.POST_JOB}
    element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    }
  />,
  <Route
    key="create-job"
    path={ROUTES.CREATE_JOB}
    element={
      <AdminRoute>
        <CreateJob />
      </AdminRoute>
    }
  />,
];
