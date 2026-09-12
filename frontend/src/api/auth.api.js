import { axiosInstance } from "./axios.js";

export const login = async (credentials) => {
  console.log("🔐 [Auth API] Login request:", credentials.email);
  const response = await axiosInstance.post("/users/login", credentials);
  console.log("🔐 [Auth API] Login response:", response.data);
  return response.data;
};

export const register = async (userData) => {
  const response = await axiosInstance.post("/users/register", userData);
  return response.data;
};

export const logout = async () => {
  const response = await axiosInstance.post("/users/logout");
  return response.data;
};