// Store
export { default as store } from "./store";

// Hooks
export { useAppDispatch, useAppSelector } from "./hooks";

// API Client
export { default as apiClient } from "./client";
export { API_ENDPOINTS } from "./config";

// Slices
export {
  // Auth slice
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsInitialized,
  selectUserProfile,
  login,
  signup,
  logout,
  refreshToken,
  checkAuthState,
  updateProfile,
  clearAuthError,
  resetAuthState,
} from "./slices/authSlice";

export {
  // Jobs slice
  selectJobs,
  selectJob,
  selectJobsLoading,
  selectJobsError,
  selectJobsPagination,
  selectJobsFilters,
  selectUserJobs,
  selectUserApplications,
  selectUserBookmarks,
  fetchJobs,
  fetchJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  bookmarkJob,
  unbookmarkJob,
  searchJobs,
  setJobFilters,
  clearJobsError,
  resetJobsState,
} from "./slices/jobsSlice";

export {
  // Users slice
  selectUsers,
  selectUsersLoading,
  selectUsersError,
  selectUsersPagination,
  fetchUsers,
  fetchUserById,
  updateUserProfile,
  uploadUserAvatar,
  deleteUser,
  updateUserStatus,
  updateUserRole,
  clearUsersError,
  resetUsersState,
} from "./slices/usersSlice";

export {
  // Admin slice
  selectAdminDashboard,
  selectAdminStats,
  selectPendingApprovals,
  selectAdminSettings,
  selectAdminLoading,
  selectAdminError,
  selectAnalytics,
  fetchAdminDashboard,
  fetchAdminUsers,
  fetchAdminJobs,
  fetchPendingApprovals,
  approveJob,
  rejectJob,
  approveUser,
  rejectUser,
  banUser,
  unbanUser,
  deleteJobAdmin,
  fetchAnalytics,
  fetchSettings,
  updateSettings,
  clearError as clearAdminError,
  clearDashboard,
  clearApprovals,
  resetAdminState,
} from "./slices/adminSlice";

export {
  // UI slice
  selectLoading,
  selectNotifications,
  selectModals,
  selectTheme,
  selectSidebar,
  selectSearch,
  selectFilters,
  selectErrors,
  selectBreadcrumbs,
  selectPageMeta,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setSearch,
  clearSearch,
  setFilters,
  clearFilters,
  addError,
  removeError,
  clearErrors,
  setBreadcrumbs,
  addBreadcrumb,
  setPageMeta,
  resetUIState,
} from "./slices/uiSlice";
