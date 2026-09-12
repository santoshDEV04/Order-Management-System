import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

// Attach Bearer JWT token from localStorage to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Universal data extractor for backend ApiResponse shape:
 * { statusCode, data, message, success }
 */
export const extractData = (response) => {
  if (!response) return null;
  const payload = response.data;
  if (payload && typeof payload === "object") {
    // If backend returns data in .data property
    if ("data" in payload && payload.data !== null && payload.data !== undefined) {
      return payload.data;
    }
    // Fallback if data is in .message (e.g., auth or createManager quirks)
    if ("message" in payload && typeof payload.message === "object" && payload.message !== null) {
      return payload.message;
    }
  }
  return payload;
};

export default axiosInstance;
