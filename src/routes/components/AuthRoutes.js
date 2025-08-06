import React from "react";
import { Route } from "react-router-dom";
import { Login, Signup } from "../../pages";
import { PublicRoute } from "../routeGuards";
import { ROUTES } from "../routeConfig";

// Authentication route definitions
export const authRoutes = [
  <Route
    key="login"
    path={ROUTES.LOGIN}
    element={
      <PublicRoute redirectIfAuthenticated={true}>
        <Login />
      </PublicRoute>
    }
  />,
  <Route
    key="signup"
    path={ROUTES.SIGNUP}
    element={
      <PublicRoute redirectIfAuthenticated={true}>
        <Signup />
      </PublicRoute>
    }
  />,
];
