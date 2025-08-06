// Route path constants
export const ROUTES = {
  // Public routes
  HOME: "/",
  ABOUT: "/about",
  SERVICES: "/services",
  CONTACT: "/contact",

  // Authentication routes
  LOGIN: "/login",
  SIGNUP: "/signup",

  // User routes
  PROFILE: "/profile",
  JOBS: "/jobs",
  JOB_DETAILS: "/jobs/:id",

  // Admin routes
  ADMIN: "/admin",
  POST_JOB: "/post-job",
  CREATE_JOB: "/create-job",
};

// Route metadata for navigation and access control
export const ROUTE_CONFIG = {
  [ROUTES.HOME]: {
    title: "Home",
    public: true,
    showInNav: true,
  },
  [ROUTES.ABOUT]: {
    title: "About Us",
    public: true,
    showInNav: true,
  },
  [ROUTES.SERVICES]: {
    title: "Services",
    public: true,
    showInNav: true,
  },
  [ROUTES.CONTACT]: {
    title: "Contact",
    public: true,
    showInNav: true,
  },
  [ROUTES.LOGIN]: {
    title: "Login",
    public: true,
    showInNav: false,
  },
  [ROUTES.SIGNUP]: {
    title: "Sign Up",
    public: true,
    showInNav: false,
  },
  [ROUTES.PROFILE]: {
    title: "Profile",
    public: false,
    requiresAuth: true,
    showInNav: false,
  },
  [ROUTES.JOBS]: {
    title: "Jobs",
    public: false,
    requiresAuth: true,
    showInNav: true,
  },
  [ROUTES.JOB_DETAILS]: {
    title: "Job Details",
    public: false,
    requiresAuth: true,
    showInNav: false,
  },
  [ROUTES.ADMIN]: {
    title: "Admin Dashboard",
    public: false,
    requiresAuth: true,
    requiresAdmin: true,
    showInNav: false,
  },
  [ROUTES.POST_JOB]: {
    title: "Post Job",
    public: false,
    requiresAuth: true,
    requiresAdmin: true,
    showInNav: false,
  },
  [ROUTES.CREATE_JOB]: {
    title: "Create Job",
    public: false,
    requiresAuth: true,
    requiresAdmin: true,
    showInNav: false,
  },
};
