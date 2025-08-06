import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../client";
import { API_ENDPOINTS } from "../config";

// Initial state
const initialState = {
  jobs: [],
  currentJob: null,
  myJobs: [],
  applications: [],
  bookmarks: [],
  totalJobs: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  filters: {
    search: "",
    location: "",
    jobType: "",
    workMode: "",
    experience: "",
    salaryMin: null,
    salaryMax: null,
  },
  sortBy: "newest",
};

// Async thunks
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { jobs } = getState();
      const queryParams = {
        page: params.page || jobs.currentPage,
        limit: params.limit || 10,
        sortBy: params.sortBy || jobs.sortBy,
        ...jobs.filters,
        ...params,
      };

      const response = await apiClient.get(
        API_ENDPOINTS.JOBS.BASE,
        queryParams
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

export const fetchJobById = createAsyncThunk(
  "jobs/fetchJobById",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOBS.BY_ID(jobId));
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const createJob = createAsyncThunk(
  "jobs/createJob",
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOBS.BASE, jobData);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const updateJob = createAsyncThunk(
  "jobs/updateJob",
  async ({ jobId, jobData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.JOBS.BY_ID(jobId),
        jobData
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

export const deleteJob = createAsyncThunk(
  "jobs/deleteJob",
  async (jobId, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.JOBS.BY_ID(jobId));
      return jobId;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const searchJobs = createAsyncThunk(
  "jobs/searchJobs",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.JOBS.SEARCH,
        searchParams
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

export const fetchMyJobs = createAsyncThunk(
  "jobs/fetchMyJobs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.JOBS.MY_JOBS, params);
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const applyToJob = createAsyncThunk(
  "jobs/applyToJob",
  async ({ jobId, applicationData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.JOBS.APPLY(jobId),
        applicationData
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

export const bookmarkJob = createAsyncThunk(
  "jobs/bookmarkJob",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOBS.BOOKMARK(jobId));
      return { jobId, ...response.data };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const trackJobView = createAsyncThunk(
  "jobs/trackJobView",
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.JOBS.VIEW(jobId));
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

// Jobs slice
const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1; // Reset to first page when sort changes
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    resetJobsState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || [];
        state.totalJobs = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentJob = action.payload.job;
        state.error = null;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create job
      .addCase(createJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload.job);
        state.totalJobs += 1;
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update job
      .addCase(updateJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.loading = false;
        const updatedJob = action.payload.job;
        const index = state.jobs.findIndex((job) => job._id === updatedJob._id);
        if (index !== -1) {
          state.jobs[index] = updatedJob;
        }
        if (state.currentJob && state.currentJob._id === updatedJob._id) {
          state.currentJob = updatedJob;
        }
        state.error = null;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete job
      .addCase(deleteJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.loading = false;
        const jobId = action.payload;
        state.jobs = state.jobs.filter((job) => job._id !== jobId);
        state.totalJobs -= 1;
        if (state.currentJob && state.currentJob._id === jobId) {
          state.currentJob = null;
        }
        state.error = null;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search jobs
      .addCase(searchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload.jobs || [];
        state.totalJobs = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.error = null;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch my jobs
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.myJobs = action.payload.jobs || [];
      })

      // Apply to job
      .addCase(applyToJob.fulfilled, (state, action) => {
        const application = action.payload.application;
        state.applications.push(application);
      })

      // Bookmark job
      .addCase(bookmarkJob.fulfilled, (state, action) => {
        const { jobId, bookmarked } = action.payload;
        if (bookmarked) {
          state.bookmarks.push(jobId);
        } else {
          state.bookmarks = state.bookmarks.filter((id) => id !== jobId);
        }
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setSortBy,
  setCurrentPage,
  clearCurrentJob,
  resetJobsState,
} = jobsSlice.actions;

// Selectors
export const selectJobs = (state) => state.jobs.jobs;
export const selectCurrentJob = (state) => state.jobs.currentJob;
export const selectJobsLoading = (state) => state.jobs.loading;
export const selectJobsError = (state) => state.jobs.error;
export const selectJobsFilters = (state) => state.jobs.filters;
export const selectJobsPagination = (state) => ({
  currentPage: state.jobs.currentPage,
  totalPages: state.jobs.totalPages,
  totalJobs: state.jobs.totalJobs,
});
export const selectMyJobs = (state) => state.jobs.myJobs;
export const selectApplications = (state) => state.jobs.applications;
export const selectBookmarks = (state) => state.jobs.bookmarks;

export default jobsSlice.reducer;
