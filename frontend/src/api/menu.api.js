import { axiosInstance, extractData } from "./axios.js";

export const getMenuItems = async (restaurantId) => {
  if (!restaurantId) return [];
  const response = await axiosInstance.get(`/resturants/${restaurantId}`);
  const data = extractData(response);
  console.log("🍽️ [Menu API] getMenuItems response shape for", restaurantId, ":", data);
  return Array.isArray(data?.menu) ? data.menu : [];
};

export const createMenuItem = async (restaurantId, itemData) => {
  const response = await axiosInstance.post(`/menu/${restaurantId}`, itemData);
  return extractData(response);
};

export const updateMenuItem = async (menuId, itemData) => {
  const response = await axiosInstance.put(`/menu/item/${menuId}`, itemData);
  return extractData(response);
};

export const deleteMenuItem = async (menuId) => {
  const response = await axiosInstance.delete(`/menu/item/${menuId}`);
  return extractData(response);
};
