import React, { useState } from 'react';
import { Shield, Lock, Check, X, Globe, UserCheck, Code, Sliders } from 'lucide-react';

const permissionsData = [
  {
    action: 'view_resturant',
    name: 'Browse Catalog & Menu',
    description: 'Viewing restaurant catalog & menu items within assigned country jurisdiction.',
    ADMIN: true,
    MANAGER: true,
    MEMBER: true,
  },
  {
    action: 'create_order',
    name: 'Create Cart / Draft Order',
    description: 'Assembling items into a draft shopping cart.',
    ADMIN: true,
    MANAGER: true,
    MEMBER: true,
  },
  {
    action: 'place_order',
    name: 'Checkout & Place Order',
    description: 'Executes final order payment transaction. Restricted from Members.',
    ADMIN: true,
    MANAGER: true,
    MEMBER: false,
  },
  {
    action: 'cancel_order',
    name: 'Cancel Active Order',
    description: 'Cancels a pending order in the database.',
    ADMIN: true,
    MANAGER: true,
    MEMBER: false,
  },
  {
    action: 'update_payment',
    name: 'Update Payment Status',
    description: 'Superuser control over order payment methods. Admin exclusive.',
    ADMIN: true,
    MANAGER: false,
    MEMBER: false,
  },
  {
    action: 'manage_users',
    name: 'Manage & Delete Users',
    description: 'Create managers or delete user accounts across countries.',
    ADMIN: true,
    MANAGER: false,
    MEMBER: false,
  },
];

const safeParseUser = () => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString || userString === 'undefined') return null;
    return JSON.parse(userString);
  } catch {
    return null;
  }
};

const RbacInspectorModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('matrix');
  const currentUser = safeParseUser();

  if (!isOpen) return null;

  const currentRole = currentUser?.role || 'MEMBER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans text-xs">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
                Policy Matrix & Security Inspector
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Real-time authorization matrix & middleware evaluation engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Session Bar */}
        {currentUser && (
          <div className="bg-[var(--bg-card)] px-6 py-2.5 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)]">Active User:</span>
              <span className="font-semibold text-[var(--text-main)]">{currentUser.name}</span>
              <span className="text-[var(--text-muted)]">({currentUser.email})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-medium bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                ROLE: {currentUser.role}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-medium bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                SCOPE: {currentUser.country || 'INDIA'}
              </span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-card)] px-6 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'matrix'
                ? 'bg-[var(--bg-panel)] text-[var(--text-main)] border-t-2 border-[var(--border-focus)] border-x border-[var(--border-subtle)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            RBAC Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('abac')}
            className={`px-3.5 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'abac'
                ? 'bg-[var(--bg-panel)] text-[var(--text-main)] border-t-2 border-[var(--border-focus)] border-x border-[var(--border-subtle)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            ABAC Country Scope Engine
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[11px] text-[var(--text-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--text-main)]">Middleware Execution Flow:</span> Express routes pass incoming requests through <code className="px-1 py-0.5 bg-[var(--bg-main)] rounded font-mono text-[var(--text-main)]">checkPermission(action)</code>. If <code className="px-1 py-0.5 bg-[var(--bg-main)] rounded font-mono text-[var(--text-main)]">req.user.role</code> is authorized, controller execution proceeds.
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-card)] text-[var(--text-muted)] font-semibold border-b border-[var(--border-subtle)]">
                    <tr>
                      <th className="py-2.5 px-4">Action</th>
                      <th className="py-2.5 px-4">Description</th>
                      <th className={`py-2.5 px-4 text-center ${currentRole === 'ADMIN' ? 'bg-[var(--bg-main)] text-[var(--text-main)] font-bold' : ''}`}>
                        ADMIN {currentRole === 'ADMIN' && '(Active)'}
                      </th>
                      <th className={`py-2.5 px-4 text-center ${currentRole === 'MANAGER' ? 'bg-[var(--bg-main)] text-[var(--text-main)] font-bold' : ''}`}>
                        MANAGER {currentRole === 'MANAGER' && '(Active)'}
                      </th>
                      <th className={`py-2.5 px-4 text-center ${currentRole === 'MEMBER' ? 'bg-[var(--bg-main)] text-[var(--text-main)] font-bold' : ''}`}>
                        MEMBER {currentRole === 'MEMBER' && '(Active)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)]">
                    {permissionsData.map((row) => (
                      <tr key={row.action} className="hover:bg-[var(--bg-card)] transition-colors">
                        <td className="py-2.5 px-4 font-mono text-[var(--text-main)] font-medium">
                          {row.action}
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-muted)] text-[11px]">
                          {row.description}
                        </td>
                        <td className="py-2.5 px-4 text-center font-medium">
                          {row.ADMIN ? <span className="text-emerald-400">Granted</span> : <span className="text-zinc-600">Denied</span>}
                        </td>
                        <td className="py-2.5 px-4 text-center font-medium">
                          {row.MANAGER ? <span className="text-emerald-400">Granted</span> : <span className="text-zinc-600">Denied</span>}
                        </td>
                        <td className="py-2.5 px-4 text-center font-medium">
                          {row.MEMBER ? <span className="text-emerald-400">Granted</span> : <span className="text-zinc-600">Denied</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'abac' && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl space-y-2">
                <div className="font-semibold text-[var(--text-main)] text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--text-muted)]" /> Country Jurisdiction Filter Mechanics
                </div>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  Attribute-Based Access Control dynamically injects user country attributes into Mongoose queries:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg">
                    <span className="font-bold text-[var(--text-main)] block mb-1">Global Scope (ADMIN)</span>
                    <code className="text-emerald-500 font-mono text-[11px]">query = &#123;&#125;</code>
                  </div>
                  <div className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg">
                    <span className="font-bold text-[var(--text-main)] block mb-1">Regional Scope (MANAGER / MEMBER)</span>
                    <code className="text-emerald-500 font-mono text-[11px]">query = &#123; country: user.country &#125;</code>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};

export default RbacInspectorModal;
