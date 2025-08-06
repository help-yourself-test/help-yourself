import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../client";
import { API_ENDPOINTS } from "../config";

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
  filters: {
    search: "",
    role: "",
    status: "",
  },
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const { users } = getState();
      const queryParams = {
        page: params.page || users.currentPage,
        limit: params.limit || 10,
        ...users.filters,
        ...params,
      };

      const response = await apiClient.get(
        API_ENDPOINTS.USERS.BASE,
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

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USERS.BY_ID(userId));
      return response.data;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "users/updateProfile",
  async ({ userId, profileData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.USERS.BY_ID(userId),
        profileData
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

export const uploadUserAvatar = createAsyncThunk(
  "users/uploadAvatar",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.upload(
        API_ENDPOINTS.USERS.UPLOAD_AVATAR,
        formData
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

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(userId));
      return userId;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        status: error.status,
      });
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "users/updateStatus",
  async ({ userId, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.USERS.BY_ID(userId),
        { status }
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

export const updateUserRole = createAsyncThunk(
  "users/updateRole",
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.USERS.BY_ID(userId),
        { role }
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

// Users slice
const usersSlice = createSlice({
  name: "users",
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
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    resetUsersState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.totalUsers = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.user;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload user avatar
      .addCase(uploadUserAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.loading = false;
        const { user } = action.payload;
        if (state.currentUser && state.currentUser._id === user._id) {
          state.currentUser = user;
        }
        const index = state.users.findIndex((u) => u._id === user._id);
        if (index !== -1) {
          state.users[index] = user;
        }
        state.error = null;
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload;
        state.users = state.users.filter((user) => user._id !== userId);
        state.totalUsers -= 1;
        if (state.currentUser && state.currentUser._id === userId) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
      })

      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updatedUser = action.payload.user;
        const index = state.users.findIndex(
          (user) => user._id === updatedUser._id
        );
        if (index !== -1) {
          state.users[index] = updatedUser;
        }
        if (state.currentUser && state.currentUser._id === updatedUser._id) {
          state.currentUser = updatedUser;
        }
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentPage,
  clearCurrentUser,
  resetUsersState,
} = usersSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectCurrentUser = (state) => state.users.currentUser;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectUsersFilters = (state) => state.users.filters;
export const selectUsersPagination = (state) => ({
  currentPage: state.users.currentPage,
  totalPages: state.users.totalPages,
  totalUsers: state.users.totalUsers,
});

export default usersSlice.reducer;
