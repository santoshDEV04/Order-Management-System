import { axiosInstance, extractData } from "./axios.js";

export const getAllUsers = async () => {
  const response = await axiosInstance.get("/users/all-users");
  const data = extractData(response);
  console.log("👥 [User API] getAllUsers raw response shape:", data);
  return Array.isArray(data) ? data : [];
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/delete-user/${userId}`);
  return extractData(response);
};

export const createManager = async (managerData) => {
  const response = await axiosInstance.post("/users/create-manager", managerData);
  // Backend returns manager object in message or data
  const data = response?.data?.message || response?.data?.data || response?.data;
  console.log("👤 [User API] createManager response:", data);
  return data;
};
