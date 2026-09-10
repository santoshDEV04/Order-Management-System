import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  getRestaurants,
  getMenuItems,
  createOrder,
  placeOrder,
  getUserOrders,
  cancelOrder,
} from '../api/resturant.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Store,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Globe,
  Plus,
  Trash2,
  Check,
  Clock,
  ArrowRight,
  Shield,
  Building,
  CheckCircle2,
  FileCheck
} from 'lucide-react';

const safeParseUser = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString || userString === 'undefined') return null;
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

const ManagerDashboard = () => {
  const queryClient = useQueryClient();
  const currentUser = safeParseUser();

  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('managerSelectedRestaurant');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('managerCart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState('restaurants');

  useEffect(() => {
    try { localStorage.setItem('managerCart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    if (selectedRestaurant) {
      try { localStorage.setItem('managerSelectedRestaurant', JSON.stringify(selectedRestaurant)); } catch {}
    } else {
      try { localStorage.removeItem('managerSelectedRestaurant'); } catch {}
    }
  }, [selectedRestaurant]);

  // Queries
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: getRestaurants,
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ['menuItems', selectedRestaurant?._id],
    queryFn: () => getMenuItems(selectedRestaurant._id),
    enabled: !!selectedRestaurant,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      setCart([]);
      localStorage.removeItem('managerCart');
      setActiveTab('orders');
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: ({ orderId, paymentData }) => placeOrder(orderId, paymentData),
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => queryClient.invalidateQueries(['orders']),
  });

  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem._id === item._id);
    if (existingItem) {
      setCart(cart.map((c) => (c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
  };

  const calculateSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Business Logic Feature: Country Regional Tax Calculation (ABAC Rule)
  const country = currentUser?.country || 'INDIA';
  const taxRate = country === 'INDIA' ? 0.18 : 0.08; // 18% GST vs 8% US Sales Tax
  const taxAmount = calculateSubtotal() * taxRate;
  const grandTotal = calculateSubtotal() + taxAmount;

  const handleCheckout = () => {
    const orderData = {
      restaurantId: selectedRestaurant._id,
      items: cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: grandTotal,
      paymentMethod: 'CARD',
    };
    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Regional Manager
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Jurisdiction: {country}</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              Manager Operations Portal
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Authorized for regional catalog inspection, financial calculation, & order execution.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">ABAC Filter Scope: <span className="font-bold text-[var(--text-main)]">{country}</span></span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">Jurisdiction Restaurants</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{restaurants.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <Store className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">Cart Items</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{cart.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">My Orders</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{orders.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">Regional Tax Standard</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1 font-mono">
                {country === 'INDIA' ? '18% GST' : '8% Sales Tax'}
              </p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Minimal Tab Bar */}
        <div className="flex bg-[var(--bg-panel)] p-1 rounded-xl mb-6 border border-[var(--border-subtle)] max-w-md text-xs">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'restaurants' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Catalog ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cart' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Orders ({orders.length})
          </button>
        </div>

        {/* RESTAURANTS TAB */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4 text-xs">
            {!selectedRestaurant ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((res) => (
                  <div
                    key={res._id}
                    onClick={() => setSelectedRestaurant(res)}
                    className="panel-card p-4 rounded-xl hover:border-[var(--border-focus)] cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-[var(--text-main)] text-sm">{res.name}</h3>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">⭐ {res.rating || '4.8'}</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs mb-3">{res.cuisine || 'Regional Cuisine'}</p>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Jurisdiction: {country}</span>
                      <span className="font-medium">Inspect Menu →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedRestaurant(null)}
                    className="text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    ← Back to Catalog
                  </button>
                  <h2 className="text-sm font-semibold text-white">{selectedRestaurant.name} Menu</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {menuItems.map((item) => (
                    <div key={item._id} className="panel-card p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-zinc-400 text-[11px]">${item.price?.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CART TAB WITH FINANCIAL TAX ENGINE */}
        {activeTab === 'cart' && (
          <div className="panel-minimal p-5 rounded-xl max-w-xl mx-auto text-xs space-y-4">
            <h2 className="text-sm font-semibold text-white">Manager Cart Checkout & Financial Calculation</h2>
            {cart.length === 0 ? (
              <p className="text-zinc-400 text-xs text-center py-6">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                    <div>
                      <p className="font-semibold text-[var(--text-main)]">{item.name}</p>
                      <p className="text-[var(--text-muted)] text-[11px]">${item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item._id)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Regional Financial Telemetry Breakdown */}
                <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] space-y-1.5 text-[var(--text-muted)]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-[var(--text-main)]">${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regional Tax ({country} {country === 'INDIA' ? '18% GST' : '8% Sales Tax'}):</span>
                    <span className="font-mono text-[var(--text-main)]">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between font-semibold text-[var(--text-main)] text-xs">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-500">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={createOrderMutation.isLoading}
                  className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-xs shadow transition-all"
                >
                  {createOrderMutation.isLoading ? 'Processing Order...' : 'Execute Order Payment (Authorized)'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB WITH LIFECYCLE WORKFLOW STEPPER */}
        {activeTab === 'orders' && (
          <div className="space-y-3 text-xs">
            {orders.map((ord) => (
              <div key={ord._id} className="panel-card p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[var(--text-muted)] font-bold">#ORDER-{ord._id.slice(-6).toUpperCase()}</span>
                    <p className="text-[var(--text-main)] font-semibold mt-0.5">Restaurant: {ord.restaurant?.name || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded font-mono font-medium bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {ord.status}
                    </span>
                    <p className="text-emerald-500 font-mono font-bold mt-1">${ord.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
                {/* Order Lifecycle Stepper Visualizer */}
                <div className="p-2.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                  <span className={`font-semibold ${ord.status === 'PENDING' ? 'text-amber-400' : 'text-zinc-500'}`}>1. Order Placed</span>
                  <span>→</span>
                  <span className={`font-semibold ${ord.status === 'PROCESSING' ? 'text-amber-400' : 'text-zinc-500'}`}>2. Processing</span>
                  <span>→</span>
                  <span className={`font-semibold ${ord.status === 'DELIVERED' ? 'text-emerald-400' : 'text-zinc-500'}`}>3. Delivered</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerDashboard;
