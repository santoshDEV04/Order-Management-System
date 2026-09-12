import React, { useState } from 'react';
import Navbar from '../Navbar';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '../../api/user.api.js';
import { getRestaurants } from '../../api/restaurant.api.js';
import { getAllOrders } from '../../api/order.api.js';
import { Users, Store, ShoppingBag, Sliders } from 'lucide-react';
import Card from '../ui/Card';
import UserList from './UserList';
import RestaurantList from './RestaurantList';
import MenuManager from './MenuManager';
import OrderList from './OrderList';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'restaurants' | 'orders'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  // Queries for header telemetry metrics
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: getAllUsers });
  const { data: restaurants = [] } = useQuery({ queryKey: ['restaurants'], queryFn: getRestaurants });
  const { data: orders = [] } = useQuery({ queryKey: ['orders'], queryFn: getAllOrders });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header Banner */}
        <div className="mb-6 panel-minimal p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Role: ADMIN
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Scope: GLOBAL</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
              Admin Operations
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage user accounts, assign regional managers, configure restaurant menus, and view all orders.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[var(--text-muted)] font-medium">All Permissions Enabled</span>
          </div>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Registered Users</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{users.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <Users className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Active Restaurants</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{restaurants.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <Store className="w-5 h-5" />
            </div>
          </Card>

          <Card className="flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] text-xs font-medium">Total System Orders</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{orders.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-[var(--bg-panel)] p-1 rounded-xl mb-6 border border-[var(--border-subtle)] max-w-md text-xs">
          <button
            onClick={() => { setActiveTab('users'); setSelectedRestaurant(null); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'restaurants'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Restaurants ({restaurants.length})
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setSelectedRestaurant(null); }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm font-semibold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Orders ({orders.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && <UserList />}

        {activeTab === 'restaurants' && (
          selectedRestaurant ? (
            <MenuManager
              restaurant={selectedRestaurant}
              onBack={() => setSelectedRestaurant(null)}
            />
          ) : (
            <RestaurantList onSelectRestaurant={setSelectedRestaurant} />
          )
        )}

        {activeTab === 'orders' && <OrderList />}
      </main>
    </div>
  );
};

export default AdminDashboard;
