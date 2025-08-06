import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  // Loading states
  loading: {
    global: false,
    page: false,
    component: false,
  },

  // Notification/Toast states
  notifications: [],

  // Modal states
  modals: {
    isJobFormOpen: false,
    isProfileModalOpen: false,
    isDeleteConfirmOpen: false,
    isApplicationModalOpen: false,
  },

  // UI preferences
  theme: localStorage.getItem("theme") || "light",
  sidebarCollapsed: JSON.parse(
    localStorage.getItem("sidebarCollapsed") || "false"
  ),

  // Search/Filter UI state
  searchVisible: false,
  filtersPanelOpen: false,

  // Error handling
  globalError: null,

  // Breadcrumbs
  breadcrumbs: [],

  // Page metadata
  pageTitle: "Help Yourself",
  pageDescription: "",
};

// UI slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading actions
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    setComponentLoading: (state, action) => {
      state.loading.component = action.payload;
    },

    // Notification actions
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        type: "info",
        autoClose: true,
        duration: 5000,
        ...action.payload,
        timestamp: new Date().toISOString(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Modal actions
    openModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },

    // Theme actions
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },

    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem(
        "sidebarCollapsed",
        JSON.stringify(state.sidebarCollapsed)
      );
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(action.payload));
    },

    // Search/Filter UI actions
    toggleSearchVisible: (state) => {
      state.searchVisible = !state.searchVisible;
    },
    setSearchVisible: (state, action) => {
      state.searchVisible = action.payload;
    },
    toggleFiltersPanel: (state) => {
      state.filtersPanelOpen = !state.filtersPanelOpen;
    },
    setFiltersPanelOpen: (state, action) => {
      state.filtersPanelOpen = action.payload;
    },

    // Error actions
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },

    // Breadcrumb actions
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbs.push(action.payload);
    },
    clearBreadcrumbs: (state) => {
      state.breadcrumbs = [];
    },

    // Page metadata actions
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
      document.title = action.payload;
    },
    setPageDescription: (state, action) => {
      state.pageDescription = action.payload;
    },
    setPageMetadata: (state, action) => {
      const { title, description } = action.payload;
      if (title) {
        state.pageTitle = title;
        document.title = title;
      }
      if (description) {
        state.pageDescription = description;
      }
    },

    // Reset UI state
    resetUIState: (state) => {
      return {
        ...initialState,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      };
    },
  },
});

export const {
  // Loading actions
  setGlobalLoading,
  setPageLoading,
  setComponentLoading,

  // Notification actions
  addNotification,
  removeNotification,
  clearNotifications,

  // Modal actions
  openModal,
  closeModal,
  closeAllModals,

  // Theme actions
  setTheme,
  toggleTheme,

  // Sidebar actions
  toggleSidebar,
  setSidebarCollapsed,

  // Search/Filter UI actions
  toggleSearchVisible,
  setSearchVisible,
  toggleFiltersPanel,
  setFiltersPanelOpen,

  // Error actions
  setGlobalError,
  clearGlobalError,

  // Breadcrumb actions
  setBreadcrumbs,
  addBreadcrumb,
  clearBreadcrumbs,

  // Page metadata actions
  setPageTitle,
  setPageDescription,
  setPageMetadata,

  // Reset
  resetUIState,
} = uiSlice.actions;

// Selectors
export const selectLoading = (state) => state.ui.loading;
export const selectGlobalLoading = (state) => state.ui.loading.global;
export const selectPageLoading = (state) => state.ui.loading.page;
export const selectComponentLoading = (state) => state.ui.loading.component;

export const selectNotifications = (state) => state.ui.notifications;

export const selectModals = (state) => state.ui.modals;
export const selectModalState = (modalName) => (state) =>
  state.ui.modals[modalName];

export const selectTheme = (state) => state.ui.theme;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;

export const selectSearchVisible = (state) => state.ui.searchVisible;
export const selectFiltersPanelOpen = (state) => state.ui.filtersPanelOpen;

export const selectGlobalError = (state) => state.ui.globalError;

export const selectBreadcrumbs = (state) => state.ui.breadcrumbs;
export const selectPageTitle = (state) => state.ui.pageTitle;
export const selectPageDescription = (state) => state.ui.pageDescription;

// Helper action creators
export const showNotification =
  (message, type = "info", options = {}) =>
  (dispatch) => {
    dispatch(
      addNotification({
        message,
        type,
        ...options,
      })
    );
  };

export const showSuccess =
  (message, options = {}) =>
  (dispatch) => {
    dispatch(
      addNotification({
        message,
        type: "success",
        ...options,
      })
    );
  };

export const showError =
  (message, options = {}) =>
  (dispatch) => {
    dispatch(
      addNotification({
        message,
        type: "error",
        autoClose: false,
        ...options,
      })
    );
  };

export const showWarning =
  (message, options = {}) =>
  (dispatch) => {
    dispatch(
      addNotification({
        message,
        type: "warning",
        ...options,
      })
    );
  };

export default uiSlice.reducer;
