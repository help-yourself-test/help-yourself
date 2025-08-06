import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../client";
import { API_ENDPOINTS } from "../config";

// Initial state
const initialState = {
  // Dashboard data
  dashboard: {
    stats: {
      totalUsers: 0,
      totalJobs: 0,
      totalApplications: 0,
      activeJobs: 0,
      pendingApprovals: 0,
    },
    recentUsers: [],
    recentJobs: [],
    recentApplications: [],
    analytics: {},
  },

  // Approvals
  approvals: {
    jobs: [],
    users: [],
    total: 0,
  },

  // System settings
  settings: {
    general: {},
    email: {},
    security: {},
    features: {},
  },

  // Loading and error states
  loading: {
    dashboard: false,
    approvals: false,
    settings: false,
    analytics: false,
  },
  error: null,
};

// Async thunks
export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const fetchAdminUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS, params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const fetchAdminJobs = createAsyncThunk(
  "admin/fetchJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.JOBS, params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const fetchPendingApprovals = createAsyncThunk(
  "admin/fetchApprovals",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.APPROVALS);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const approveJob = createAsyncThunk(
  "admin/approveJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.APPROVALS}/jobs/${jobId}/approve`
      );
      return { jobId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const rejectJob = createAsyncThunk(
  "admin/rejectJob",
  async ({ jobId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.APPROVALS}/jobs/${jobId}/reject`,
        { reason }
      );
      return { jobId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const approveUser = createAsyncThunk(
  "admin/approveUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.APPROVALS}/users/${userId}/approve`
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const rejectUser = createAsyncThunk(
  "admin/rejectUser",
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.APPROVALS}/users/${userId}/reject`,
        { reason }
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const banUser = createAsyncThunk(
  "admin/banUser",
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}/ban`,
        { reason }
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const unbanUser = createAsyncThunk(
  "admin/unbanUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        `${API_ENDPOINTS.ADMIN.USERS}/${userId}/unban`
      );
      return { userId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const deleteJobAdmin = createAsyncThunk(
  "admin/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.JOBS}/${jobId}`);
      return jobId;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "admin/fetchAnalytics",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.ADMIN.ANALYTICS,
        params
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const fetchSettings = createAsyncThunk(
  "admin/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const updateSettings = createAsyncThunk(
  "admin/updateSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.ADMIN.SETTINGS,
        settings
      );
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

// Admin slice
const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboard: (state) => {
      state.dashboard = initialState.dashboard;
    },
    clearApprovals: (state) => {
      state.approvals = initialState.approvals;
    },
    resetAdminState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admin dashboard
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading.dashboard = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = { ...state.dashboard, ...action.payload };
        state.error = null;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload;
      })

      // Fetch pending approvals
      .addCase(fetchPendingApprovals.pending, (state) => {
        state.loading.approvals = true;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.fulfilled, (state, action) => {
        state.loading.approvals = false;
        state.approvals = action.payload;
        state.error = null;
      })
      .addCase(fetchPendingApprovals.rejected, (state, action) => {
        state.loading.approvals = false;
        state.error = action.payload;
      })

      // Approve job
      .addCase(approveJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        state.approvals.jobs = state.approvals.jobs.filter(
          (job) => job._id !== jobId
        );
        state.approvals.total -= 1;
      })

      // Reject job
      .addCase(rejectJob.fulfilled, (state, action) => {
        const { jobId } = action.payload;
        state.approvals.jobs = state.approvals.jobs.filter(
          (job) => job._id !== jobId
        );
        state.approvals.total -= 1;
      })

      // Approve user
      .addCase(approveUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.approvals.users = state.approvals.users.filter(
          (user) => user._id !== userId
        );
        state.approvals.total -= 1;
      })

      // Reject user
      .addCase(rejectUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.approvals.users = state.approvals.users.filter(
          (user) => user._id !== userId
        );
        state.approvals.total -= 1;
      })

      // Fetch analytics
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.dashboard.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error = action.payload;
      })

      // Fetch settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading.settings = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = action.payload;
        state.error = null;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.payload;
      })

      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.loading.settings = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading.settings = false;
        state.settings = { ...state.settings, ...action.payload };
        state.error = null;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading.settings = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearDashboard, clearApprovals, resetAdminState } =
  adminSlice.actions;

// Selectors
export const selectAdminDashboard = (state) => state.admin.dashboard;
export const selectAdminStats = (state) => state.admin.dashboard.stats;
export const selectPendingApprovals = (state) => state.admin.approvals;
export const selectAdminSettings = (state) => state.admin.settings;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;
export const selectAnalytics = (state) => state.admin.dashboard.analytics;

export default adminSlice.reducer;
