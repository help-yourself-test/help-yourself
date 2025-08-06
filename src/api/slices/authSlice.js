import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../client";
import { API_ENDPOINTS } from "../config";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("authToken"),
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
};

// Async thunks
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      const { token, user } = response.data;

      // Store token
      apiClient.setAuthToken(token);
      localStorage.setItem("userData", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const signupUser = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.SIGNUP,
        userData
      );
      const { token, user } = response.data;

      // Store token
      apiClient.setAuthToken(token);
      localStorage.setItem("userData", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Always clear local storage
      apiClient.setAuthToken(null);
      localStorage.removeItem("userData");
    }

    return {};
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
      const { token, user } = response.data;

      apiClient.setAuthToken(token);
      localStorage.setItem("userData", JSON.stringify(user));

      return { token, user };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.AUTH.PROFILE,
        profileData
      );
      const { user } = response.data;

      localStorage.setItem("userData", JSON.stringify(user));

      return { user };
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        passwordData
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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
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

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

// Initialize auth state from localStorage
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const userDataString = localStorage.getItem("userData");

      if (!token || !userDataString) {
        return { user: null, token: null, isAuthenticated: false };
      }

      // Verify token is still valid
      try {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
        const validatedUser = response.data.user;

        localStorage.setItem("userData", JSON.stringify(validatedUser));

        return {
          user: validatedUser,
          token,
          isAuthenticated: true,
        };
      } catch (error) {
        // Token is invalid, clear storage
        apiClient.setAuthToken(null);
        localStorage.removeItem("userData");

        return { user: null, token: null, isAuthenticated: false };
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      apiClient.setAuthToken(null);
      localStorage.removeItem("userData");
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Initialize auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsInitialized = (state) => state.auth.isInitialized;

export default authSlice.reducer;
