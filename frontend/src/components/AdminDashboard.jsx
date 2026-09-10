import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
  getAllUsers,
  deleteUser,
  createManager,
  getRestaurants,
  getMenuItems,
  getAllOrders,
  createMenuItem,
  deleteMenuItem,
} from '../api/admin.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Store,
  ShoppingBag,
  DollarSign,
  Plus,
  Trash2,
  Check,
  Clock,
  X,
  Shield,
  Search,
  Globe,
  UserPlus,
  AlertCircle,
  Sliders,
  FileText,
  TrendingUp,
  ArrowRight
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

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const currentUser = safeParseUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', password: '', country: 'INDIA' });
  const [menuItemForm, setMenuItemForm] = useState({ name: '', description: '', price: '', category: 'Main' });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedRestaurant');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'policy' | 'restaurants' | 'orders'
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Dynamic Policy Overrides (Business Feature)
  const [policyOverrides, setPolicyOverrides] = useState({
    managerCanCancel: true,
    memberCanDraft: true,
    managerCanUpdatePayment: false,
  });

  // Queries
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

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
    queryFn: getAllOrders,
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const createManagerMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setFormData({ name: '', email: '', password: '', country: 'INDIA' });
      setShowCreateForm(false);
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: ({ restaurantId, data }) => createMenuItem(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['menuItems']);
      setMenuItemForm({ name: '', description: '', price: '', category: 'Main' });
      setShowMenuItemForm(false);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => queryClient.invalidateQueries(['menuItems']),
  });

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  if (usersLoading)
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center text-[var(--text-main)] font-sans">
        <div className="w-8 h-8 border-2 border-[var(--border-focus)] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[var(--text-muted)] font-medium">Loading Governance Controls...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Minimal Banner */}
        <div className="mb-6 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                Superuser Console
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Global Jurisdiction</span>
            </div>
            <h1 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
              System Administration & Governance
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              User identity management, dynamic policy configuration, & platform telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[var(--text-muted)] font-medium">Full Governance Active</span>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">Total Registered Users</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{users.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">Active Restaurants</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{restaurants.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <Store className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">System Total Orders</p>
              <p className="text-2xl font-bold text-[var(--text-main)] mt-1 font-mono">{orders.length}</p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[var(--text-muted)] font-medium">System Managers</p>
              <p className="text-2xl font-bold text-emerald-500 mt-1 font-mono">
                {users.filter((u) => u.role === 'MANAGER').length}
              </p>
            </div>
            <div className="p-2.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-muted)]">
              <Shield className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Minimal Tab Bar */}
        <div className="flex bg-[var(--bg-panel)] p-1 rounded-xl mb-6 border border-[var(--border-subtle)] max-w-xl text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'users' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> User Directory ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'policy' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Policy Sandbox
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'restaurants' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Store className="w-3.5 h-3.5" /> Restaurants ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> System Orders
          </button>
        </div>

        {/* TAB 1: USERS */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Filter users by name or email..."
                  className="w-full pl-9 pr-3 py-2 input-minimal rounded-xl"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="w-full sm:w-auto px-3.5 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Manager Account</span>
              </button>
            </div>

            {/* Create Manager Modal Form */}
            {showCreateForm && (
              <div className="panel-minimal p-5 rounded-xl animate-fade-in">
                <h3 className="text-sm font-semibold text-[var(--text-main)] mb-3">Create New Regional Manager</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createManagerMutation.mutate(formData);
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs"
                >
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 input-minimal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full px-3 py-2 input-minimal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="w-full px-3 py-2 input-minimal rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-muted)] mb-1">Jurisdiction Scope</label>
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2 input-minimal rounded-lg"
                    >
                      <option value="INDIA">INDIA Jurisdiction</option>
                      <option value="AMERICA">AMERICA Jurisdiction</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-3.5 py-1.5 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createManagerMutation.isLoading}
                      className="px-4 py-1.5 bg-zinc-100 text-zinc-950 font-semibold rounded-lg shadow"
                    >
                      {createManagerMutation.isLoading ? 'Creating...' : 'Create Manager Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            <div className="panel-minimal rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-panel)] text-[var(--text-muted)] font-medium border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="py-2.5 px-4">User Identity</th>
                      <th className="py-2.5 px-4">Email</th>
                      <th className="py-2.5 px-4">System Role</th>
                      <th className="py-2.5 px-4">Jurisdiction</th>
                      <th className="py-2.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-[var(--bg-card)] transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-[var(--text-main)] flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center font-bold text-[10px]">
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">{u.email}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded font-mono font-medium text-[10px] bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-muted)]">
                          {u.country || 'GLOBAL'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete user ${u.name}?`)) {
                                deleteMutation.mutate(u._id);
                              }
                            }}
                            className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DYNAMIC POLICY SANDBOX (BUSINESS LOGIC FEATURE) */}
        {activeTab === 'policy' && (
          <div className="space-y-4 text-xs">
            <div className="panel-minimal p-5 rounded-xl space-y-3">
              <div className="font-semibold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-zinc-300" /> Dynamic RBAC Security Policy Manager
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                As a system administrator, you can test and toggle runtime security policies dynamically across all active user roles.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                  <div>
                    <p className="font-medium text-[var(--text-main)]">Allow MANAGER role to cancel orders</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Controls whether regional managers can revoke pending orders in their jurisdiction.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyOverrides.managerCanCancel}
                    onChange={(e) => setPolicyOverrides({ ...policyOverrides, managerCanCancel: e.target.checked })}
                    className="w-4 h-4 accent-zinc-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                  <div>
                    <p className="font-medium text-[var(--text-main)]">Allow MEMBER role to create draft shopping carts</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Controls whether members can assemble cart items prior to escalation.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyOverrides.memberCanDraft}
                    onChange={(e) => setPolicyOverrides({ ...policyOverrides, memberCanDraft: e.target.checked })}
                    className="w-4 h-4 accent-zinc-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                  <div>
                    <p className="font-medium text-[var(--text-main)]">Allow MANAGER role to override payment status</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Controls whether payment status editing is exclusive to ADMIN or extended to MANAGER.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={policyOverrides.managerCanUpdatePayment}
                    onChange={(e) => setPolicyOverrides({ ...policyOverrides, managerCanUpdatePayment: e.target.checked })}
                    className="w-4 h-4 accent-zinc-200"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESTAURANTS */}
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
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">📍 {res.country || 'INDIA'}</span>
                    </div>
                    <p className="text-[var(--text-muted)] text-xs mb-3">{res.cuisine || 'Fine Dining'}</p>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Rating: ⭐ {res.rating || '4.8'}</span>
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
                    className="text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    ← Back to Restaurants
                  </button>
                  <button
                    onClick={() => setShowMenuItemForm(!showMenuItemForm)}
                    className="px-3 py-1.5 bg-zinc-100 text-zinc-950 font-semibold rounded-lg"
                  >
                    + Add Menu Item
                  </button>
                </div>

                {showMenuItemForm && (
                  <div className="panel-minimal p-4 rounded-xl mb-4">
                    <h3 className="font-semibold text-white mb-2">Add Menu Item to {selectedRestaurant.name}</h3>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        createMenuItemMutation.mutate({
                          restaurantId: selectedRestaurant._id,
                          data: { ...menuItemForm, price: parseFloat(menuItemForm.price) },
                        });
                      }}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <input
                        type="text"
                        placeholder="Item Name"
                        value={menuItemForm.name}
                        onChange={(e) => setMenuItemForm({ ...menuItemForm, name: e.target.value })}
                        required
                        className="px-3 py-1.5 input-minimal rounded-lg"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price ($)"
                        value={menuItemForm.price}
                        onChange={(e) => setMenuItemForm({ ...menuItemForm, price: e.target.value })}
                        required
                        className="px-3 py-1.5 input-minimal rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={menuItemForm.description}
                        onChange={(e) => setMenuItemForm({ ...menuItemForm, description: e.target.value })}
                        className="px-3 py-1.5 input-minimal rounded-lg"
                      />
                      <div className="sm:col-span-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMenuItemForm(false)}
                          className="px-3 py-1 bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-lg"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="px-3 py-1 bg-zinc-100 text-zinc-950 font-semibold rounded-lg">
                          Save Item
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {menuItems.map((item) => (
                    <div key={item._id} className="panel-card p-4 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="text-zinc-400 text-[11px]">${item.price?.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => deleteMenuItemMutation.mutate(item._id)}
                        className="text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-3 text-xs">
            {orders.map((ord) => (
              <div key={ord._id} className="panel-card p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-[var(--text-muted)] font-bold">#ORDER-{ord._id.slice(-6).toUpperCase()}</span>
                  <p className="text-[var(--text-main)] font-medium mt-0.5">Restaurant: {ord.restaurant?.name || 'N/A'}</p>
                  <p className="text-[var(--text-muted)] text-[11px]">Total: <span className="text-emerald-500 font-bold">${ord.totalAmount?.toFixed(2)}</span></p>
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

export default AdminDashboard;
