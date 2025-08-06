// Base API configuration
export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// API endpoints configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    SIGNUP: "/auth/signup",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    PROFILE: "/auth/profile",
  },
  JOBS: {
    BASE: "/jobs",
    BY_ID: (id) => `/jobs/${id}`,
    SEARCH: "/jobs/search",
    MY_JOBS: "/jobs/my-jobs",
    APPLICATIONS: "/jobs/applications",
    APPLY: (id) => `/jobs/${id}/apply`,
    BOOKMARK: (id) => `/jobs/${id}/bookmark`,
    VIEW: (id) => `/jobs/${id}/view`,
  },
  USERS: {
    BASE: "/users",
    BY_ID: (id) => `/users/${id}`,
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    CHANGE_PASSWORD: "/users/change-password",
    UPLOAD_AVATAR: "/users/upload-avatar",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    JOBS: "/admin/jobs",
    ANALYTICS: "/admin/analytics",
    APPROVALS: "/admin/approvals",
    SETTINGS: "/admin/settings",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
    MARK_READ: (id) => `/notifications/${id}/mark-read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
  },
};

// HTTP methods
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

// Request configuration
export const REQUEST_CONFIG = {
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
};

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};
