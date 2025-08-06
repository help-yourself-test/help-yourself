import { API_BASE_URL, REQUEST_CONFIG, STATUS_CODES } from "./config";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = REQUEST_CONFIG.timeout;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem("authToken");
  }

  // Set auth token
  setAuthToken(token) {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }

  // Get request headers
  getHeaders(customHeaders = {}) {
    const headers = {
      ...REQUEST_CONFIG.headers,
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  // Handle API response
  async handleResponse(response) {
    let data;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(
        data?.message || `HTTP Error: ${response.status}`
      );
      error.status = response.status;
      error.data = data;

      // Handle specific error cases
      if (response.status === STATUS_CODES.UNAUTHORIZED) {
        this.setAuthToken(null);
        // Dispatch logout action or redirect to login
        window.location.href = "/login";
      }

      throw error;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const {
      method = "GET",
      body,
      headers: customHeaders = {},
      signal,
      ...otherOptions
    } = options;

    const headers = this.getHeaders(customHeaders);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const config = {
        method,
        headers,
        signal: signal || controller.signal,
        ...otherOptions,
      };

      // Add body for non-GET requests
      if (body && method !== "GET") {
        if (body instanceof FormData) {
          // Remove Content-Type header for FormData (browser will set it)
          delete config.headers["Content-Type"];
          config.body = body;
        } else if (typeof body === "object") {
          config.body = JSON.stringify(body);
        } else {
          config.body = body;
        }
      }

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      return await this.handleResponse(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }

      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}, options = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    return this.request(url.pathname + url.search, {
      method: "GET",
      ...options,
    });
  }

  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
      ...options,
    });
  }

  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data,
      ...options,
    });
  }

  async patch(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: "DELETE",
      ...options,
    });
  }

  // File upload method
  async upload(endpoint, formData, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: formData,
      ...options,
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
