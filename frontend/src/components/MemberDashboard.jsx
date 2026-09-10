import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  getRestaurants,
  getMenuItems,
  getUserOrders,
} from '../api/resturant.api';
import { useQuery } from '@tanstack/react-query';
import {
  Store,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Globe,
  Lock,
  Trash2,
  Check,
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

const LS_CART_KEY = 'member_dashboard_cart';
const LS_RESTAURANT_KEY = 'member_dashboard_selected_restaurant';

const MemberDashboard = () => {
  const currentUser = safeParseUser();
  const country = currentUser?.country || 'INDIA';

  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_RESTAURANT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(LS_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeTab, setActiveTab] = useState('restaurants');

  useEffect(() => {
    try { localStorage.setItem(LS_CART_KEY, JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    if (selectedRestaurant) {
      try { localStorage.setItem(LS_RESTAURANT_KEY, JSON.stringify(selectedRestaurant)); } catch {}
    } else {
      try { localStorage.removeItem(LS_RESTAURANT_KEY); } catch {}
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

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
  });

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      return existing
        ? prev.map((c) => (c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c))
        : [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i._id !== itemId));
  };

  const calculateSubtotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const taxRate = country === 'INDIA' ? 0.18 : 0.08;
  const taxAmount = calculateSubtotal() * taxRate;
  const grandTotal = calculateSubtotal() + taxAmount;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-4 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Standard Member
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Jurisdiction: {country}</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              Member Catalog Portal
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Browse food catalogs & draft shopping carts under RBAC security evaluation.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">ABAC Filter Scope: <span className="font-bold text-[var(--text-main)]">{country}</span></span>
          </div>
        </div>

        {/* RBAC Member Notice */}
        <div className="mb-6 p-4 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-muted)] flex items-start gap-3">
          <Lock className="w-4 h-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--text-main)] block mb-0.5">
              Live RBAC Enforcer Notice: Member Role Restriction
            </span>
            <p className="text-[var(--text-muted)] leading-relaxed text-[11px]">
              As a logged-in <code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">MEMBER</code>, you can view restaurants and draft carts. However, the action <code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">place_order</code> is restricted by Express RBAC middleware to <code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">MANAGER</code> and <code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">ADMIN</code> roles. Switch persona in the header to execute orders.
            </p>
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

        {/* CATALOG TAB */}
        {activeTab === 'restaurants' && (
          <div className="space-y-4 text-xs">
            {!selectedRestaurant ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurants.map((res) => (
                  <div
                    key={res._id}
                    onClick={() => setSelectedRestaurant(res)}
                    className="panel-card p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm">{res.name}</h3>
                      <span className="text-[11px] text-zinc-400 font-mono">⭐ {res.rating || '4.8'}</span>
                    </div>
                    <p className="text-zinc-400 text-xs mb-3">{res.cuisine || 'Gourmet Selection'}</p>
                    <div className="pt-2 border-t border-zinc-800 flex justify-between text-[11px] text-zinc-300">
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

        {/* CART TAB */}
        {activeTab === 'cart' && (
          <div className="panel-minimal p-5 rounded-xl max-w-xl mx-auto text-xs space-y-4">
            <h2 className="text-sm font-semibold text-white">Member Cart Overview & Financial Telemetry</h2>
            {cart.length === 0 ? (
              <p className="text-zinc-400 text-xs text-center py-6">Your cart is empty.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2.5 bg-zinc-900 rounded-lg border border-zinc-800">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-zinc-400 text-[11px]">${item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">${(item.price * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item._id)} className="text-zinc-500 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Tax Engine */}
                <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] space-y-1 text-[var(--text-muted)]">
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

                <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Action Restricted for MEMBER
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Members cannot execute final checkout (<code className="text-[var(--text-main)] font-mono">place_order</code>). Switch to Manager or Admin persona in header to complete transaction.
                  </p>
                </div>

                <button
                  disabled
                  className="w-full py-2.5 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-semibold rounded-xl text-xs cursor-not-allowed opacity-70 flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" /> Checkout Restricted (Requires Manager / Admin Role)
                </button>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3 text-xs">
            {orders.map((ord) => (
              <div key={ord._id} className="panel-card p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-zinc-400 font-bold">#ORDER-{ord._id.slice(-6).toUpperCase()}</span>
                  <p className="text-white font-medium mt-0.5">Restaurant: {ord.restaurant?.name || 'N/A'}</p>
                  <p className="text-zinc-400 text-[11px]">Total: <span className="text-emerald-400 font-bold">${ord.totalAmount?.toFixed(2)}</span></p>
                </div>
                <span className="px-2 py-0.5 rounded font-mono font-medium bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  {ord.status}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MemberDashboard;
