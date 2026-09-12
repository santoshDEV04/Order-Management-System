import React, { useState } from 'react';
import Navbar from '../Navbar';
import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '../../api/restaurant.api.js';
import { getAllOrders } from '../../api/order.api.js';
import { useCart } from '../../context/CartContext.jsx';
import { Store, ShoppingCart, ShoppingBag, Globe, FileCheck } from 'lucide-react';
import Card from '../ui/Card';
import ManagerCatalog from './ManagerCatalog';
import ManagerCart from './ManagerCart';
import ManagerOrders from './ManagerOrders';

const safeParseUser = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString || userString === 'undefined') return null;
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

export const ManagerDashboard = () => {
  const currentUser = safeParseUser();
  const country = currentUser?.country || 'INDIA';
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'cart' | 'orders'
  const { cart } = useCart();

  const { data: restaurants = [] } = useQuery({ queryKey: ['restaurants'], queryFn: getRestaurants });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: getAllOrders });

  const jurisdictionOrders = orders.filter((o) => {
    const orderCountry = o.country || o.restaurant?.country;
    return !country || country === 'GLOBAL' || orderCountry === country;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Banner */}
        <div className="mb-6 panel-minimal p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Role: MANAGER
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Scope: {country}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              Manager Operations
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Browse {country} restaurants, place orders, and review or approve pending member orders.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">
              Regional Scope: <strong className="text-[var(--text-main)]">{country}</strong>
            </span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Jurisdiction Restaurants</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{restaurants.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <Store className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Active Cart Items</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{cart.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Regional Orders</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{jurisdictionOrders.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Regional Tax Standard</p>
              <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                {country === 'INDIA' ? '18% GST' : '8% Tax'}
              </p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <FileCheck className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[var(--bg-panel)] p-1 rounded-xl mb-6 border border-[var(--border-subtle)] max-w-md text-xs">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Catalog ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'cart'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Cart ({cart.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Orders ({jurisdictionOrders.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'catalog' && <ManagerCatalog country={country} />}
        {activeTab === 'cart' && (
          <ManagerCart
            country={country}
            onOrderSuccess={() => setActiveTab('orders')}
          />
        )}
        {activeTab === 'orders' && <ManagerOrders country={country} />}
      </main>
    </div>
  );
};

export default ManagerDashboard;
