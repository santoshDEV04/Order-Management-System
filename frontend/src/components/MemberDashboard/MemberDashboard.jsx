import React, { useState } from 'react';
import Navbar from '../Navbar';
import { useQuery } from '@tanstack/react-query';
import { getRestaurants } from '../../api/restaurant.api.js';
import { getMyOrders } from '../../api/order.api.js';
import { useCart } from '../../context/CartContext.jsx';
import { Store, ShoppingCart, ShoppingBag, Globe, Lock } from 'lucide-react';
import Card from '../ui/Card';
import MemberCatalog from './MemberCatalog';
import MemberCart from './MemberCart';
import MemberOrders from './MemberOrders';

const safeParseUser = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString || userString === 'undefined') return null;
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

export const MemberDashboard = () => {
  const currentUser = safeParseUser();
  const country = currentUser?.country || 'INDIA';
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'cart' | 'orders'
  const { cart } = useCart();

  const { data: restaurants = [] } = useQuery({ queryKey: ['restaurants'], queryFn: getRestaurants });
  const { data: myOrders = [] } = useQuery({ queryKey: ['orders', 'my-orders'], queryFn: getMyOrders });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Banner */}
        <div className="mb-4 panel-minimal p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Role: MEMBER
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Scope: {country}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              Member Portal
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Browse {country} restaurants, assemble cart items, and submit draft orders for manager approval.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <Globe className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">
              Regional Scope: <strong className="text-[var(--text-main)]">{country}</strong>
            </span>
          </div>
        </div>

        {/* RBAC Notice Callout */}
        <div className="mb-6 p-3.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl flex items-start gap-3 text-xs">
          <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text-main)] block mb-0.5">RBAC Demonstration Notice:</strong>
            As a <code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">MEMBER</code>, you can view menus and submit draft orders (<code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">create_order</code>). Once submitted, the order is saved in the database where your Regional Manager (<code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">MANAGER</code>) or Admin can authorize payment (<code className="px-1 py-0.5 bg-[var(--bg-card)] rounded font-mono text-[var(--text-main)]">place_order</code>). Use the persona switcher in the header to observe both roles.
          </div>
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
            <ShoppingBag className="w-3.5 h-3.5" /> My Orders ({myOrders.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'catalog' && <MemberCatalog country={country} />}
        {activeTab === 'cart' && (
          <MemberCart
            country={country}
            onOrderSubmitted={() => setActiveTab('orders')}
          />
        )}
        {activeTab === 'orders' && <MemberOrders />}
      </main>
    </div>
  );
};

export default MemberDashboard;
