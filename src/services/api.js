const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Set auth token in localStorage
  setAuthToken(token) {
    localStorage.setItem("authToken", token);
  }

  // Remove auth token from localStorage
  removeAuthToken() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
  }

  // Get default headers
  getHeaders(includeAuth = false) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic API request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(options.includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return { data, response };
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async getProfile() {
    return this.request("/auth/profile", {
      method: "GET",
      includeAuth: true,
    });
  }

  async updateProfile(userData) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
      includeAuth: true,
    });
  }

  async logout() {
    try {
      await this.request("/auth/logout", {
        method: "POST",
        includeAuth: true,
      });
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      this.removeAuthToken();
    }
  }

  // Update Job Seeker Profile
  async updateJobSeekerProfile(profileData) {
    return this.request("/auth/profile/job-seeker", {
      method: "PUT",
      body: JSON.stringify(profileData),
      includeAuth: true,
    });
  }

  // Update Job Poster Profile
  async updateJobPosterProfile(profileData) {
    return this.request("/auth/profile/job-poster", {
      method: "PUT",
      body: JSON.stringify(profileData),
      includeAuth: true,
    });
  }

  // Switch user role between job-seeker and job-poster
  async switchRole(newRole) {
    return this.request("/auth/switch-role", {
      method: "PUT",
      body: JSON.stringify({ newRole }),
      includeAuth: true,
    });
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      // Basic check if token exists and is not expired
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        this.removeAuthToken();
        return false;
      }

      return true;
    } catch (error) {
      this.removeAuthToken();
      return false;
    }
  }

  // Get user data from localStorage
  getUserData() {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }

  // ===== JOB MANAGEMENT =====

  // Get all jobs with optional filters
  async getJobs(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/jobs${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint, {
      method: "GET",
    });
  }

  // Get single job by ID
  async getJob(jobId) {
    return this.request(`/jobs/${jobId}`, {
      method: "GET",
    });
  }

  // Get job details with full information
  async getJobDetails(jobId) {
    // Use the same endpoint as getJob since backend has single endpoint for job details
    return this.getJob(jobId);
  }

  // Track job view (views are automatically tracked when fetching job details)
  async trackJobView(jobId) {
    // Views are automatically incremented when fetching job details in the backend
    // No separate endpoint needed
    return Promise.resolve({ success: true });
  }

  // Create new job (admin only)
  async createJob(jobData) {
    return this.request("/jobs", {
      method: "POST",
      includeAuth: true,
      body: JSON.stringify(jobData),
    });
  }

  // Update job (admin only)
  async updateJob(jobId, jobData) {
    return this.request(`/jobs/${jobId}`, {
      method: "PUT",
      includeAuth: true,
      body: JSON.stringify(jobData),
    });
  }

  // Delete job (admin only)
  async deleteJob(jobId) {
    return this.request(`/jobs/${jobId}`, {
      method: "DELETE",
      includeAuth: true,
    });
  }

  // Get admin's jobs
  async getAdminJobs(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/jobs/admin/my-jobs${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
      includeAuth: true,
    });
  }

  // ===== USER MANAGEMENT (ADMIN) =====

  // Check user status by email (admin only)
  async checkUserStatus(email) {
    return this.request(`/admin/user-status/${encodeURIComponent(email)}`, {
      method: "GET",
      includeAuth: true,
    });
  }

  // Get all users (admin only)
  async getUsers(params = {}) {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint, {
      method: "GET",
      includeAuth: true,
    });
  }

  // Get pending admin approvals
  async getPendingApprovals() {
    return this.request("/admin/pending-approvals", {
      method: "GET",
      includeAuth: true,
    });
  }

  // Approve admin user
  async approveAdmin(userId) {
    return this.request(`/admin/approve/${userId}`, {
      method: "POST",
      includeAuth: true,
    });
  }

  // Reject admin approval
  async rejectAdmin(userId) {
    return this.request(`/admin/reject/${userId}`, {
      method: "POST",
      includeAuth: true,
    });
  }

  // Update user role (admin only)
  async updateUserRole(userId, role) {
    return this.request(`/admin/users/${userId}/role`, {
      method: "PUT",
      includeAuth: true,
      body: JSON.stringify({ role }),
    });
  }

  // Delete user (admin only)
  async deleteUser(userId) {
    return this.request(`/admin/users/${userId}`, {
      method: "DELETE",
      includeAuth: true,
    });
  }
}

const apiService = new ApiService();
export default apiService;
