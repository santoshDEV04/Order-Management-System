import { axiosInstance, extractData } from "./axios.js";

/**
 * Get all system orders (ADMIN & MANAGER)
 */
export const getAllOrders = async () => {
  const response = await axiosInstance.get("/orders/all");
  const data = extractData(response);
  console.log("📦 [Order API] getAllOrders response shape:", data);
  return Array.isArray(data) ? data : [];
};

/**
 * Get orders placed by current user (MEMBER, MANAGER, ADMIN)
 */
export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders/my-orders");
  const data = extractData(response);
  console.log("📦 [Order API] getMyOrders response shape:", data);
  return Array.isArray(data) ? data : [];
};

/**
 * Create a new order (draft) - accessible by MEMBER, MANAGER, ADMIN
 */
export const createOrder = async (orderData) => {
  console.log("📦 [Order API] Sending createOrder payload:", orderData);
  const response = await axiosInstance.post("/orders", orderData);
  const data = extractData(response);
  console.log("✅ [Order API] createOrder success response:", data);
  return data;
};

/**
 * Checkout & place order (mark as PAID) - restricted to ADMIN & MANAGER
 */
export const placeOrder = async (orderId, paymentData = {}) => {
  const response = await axiosInstance.post(`/orders/${orderId}/place`, paymentData);
  return extractData(response);
};

/**
 * Cancel an order - restricted to ADMIN & MANAGER
 */
export const cancelOrder = async (orderId) => {
  const response = await axiosInstance.delete(`/orders/${orderId}`);
  return extractData(response);
};

/**
 * Update payment method (CARD, UPI, CASH) - ADMIN only
 */
export const updatePaymentMethod = async (orderId, paymentMethod) => {
  const response = await axiosInstance.patch(`/orders/${orderId}/payment`, { paymentMethod });
  return extractData(response);
};
