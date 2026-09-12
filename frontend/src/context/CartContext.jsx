import React, { createContext, useContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'rbac_active_cart';
const RESTAURANT_STORAGE_KEY = 'rbac_active_restaurant';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem(RESTAURANT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep localStorage synchronized
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (selectedRestaurant) {
        localStorage.setItem(RESTAURANT_STORAGE_KEY, JSON.stringify(selectedRestaurant));
      } else {
        localStorage.removeItem(RESTAURANT_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save restaurant to localStorage", e);
    }
  }, [selectedRestaurant]);

  const addToCart = (item, restaurant) => {
    if (restaurant && (!selectedRestaurant || selectedRestaurant._id !== restaurant._id)) {
      // If switching restaurants, set new restaurant and reset items
      setSelectedRestaurant(restaurant);
      setCart([{ ...item, quantity: 1, restaurantId: restaurant._id }]);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((i) => i._id === item._id);
      if (existing) {
        return prevCart.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1, restaurantId: restaurant?._id || selectedRestaurant?._id }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item._id !== itemId);
      if (updated.length === 0) {
        setSelectedRestaurant(null);
      }
      return updated;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item._id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedRestaurant(null);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(RESTAURANT_STORAGE_KEY);
    } catch {}
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedRestaurant,
        setSelectedRestaurant,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateSubtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
