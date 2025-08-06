import React from "react";
import { Route } from "react-router-dom";
import { Profile } from "../../pages";
import { ProtectedRoute } from "../routeGuards";
import { ROUTES } from "../routeConfig";

// User route definitions (require authentication)
export const userRoutes = [
  <Route
    key="profile"
    path={ROUTES.PROFILE}
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />,
];
