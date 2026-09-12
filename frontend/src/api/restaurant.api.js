import { axiosInstance, extractData } from "./axios.js";

export const getRestaurants = async () => {
  const response = await axiosInstance.get("/resturants");
  const data = extractData(response);
  console.log("🏪 [Restaurant API] getRestaurants response shape:", data);
  return Array.isArray(data) ? data : [];
};

export const getRestaurantById = async (restaurantId) => {
  if (!restaurantId) return null;
  const response = await axiosInstance.get(`/resturants/${restaurantId}`);
  const data = extractData(response);
  console.log("🏪 [Restaurant API] getRestaurantById response shape:", data);
  return data;
};

export const createRestaurant = async (restaurantData) => {
  const response = await axiosInstance.post("/resturants", restaurantData);
  return extractData(response);
};

export const updateRestaurant = async (restaurantId, updateData) => {
  const response = await axiosInstance.put(`/resturants/${restaurantId}`, updateData);
  return extractData(response);
};

export const deleteRestaurant = async (restaurantId) => {
  const response = await axiosInstance.delete(`/resturants/${restaurantId}`);
  return extractData(response);
};
