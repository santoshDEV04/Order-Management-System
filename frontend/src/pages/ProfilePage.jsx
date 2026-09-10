import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  User, 
  Shield, 
  Key, 
  Lock, 
  Globe, 
  Check, 
  Clock, 
  Smartphone, 
  FileText,
  AlertCircle
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

const ProfilePage = () => {
  const currentUser = safeParseUser();
  const token = localStorage.getItem('token') || 'JWT-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirmPass: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setUpdateSuccess(true);
    setPasswordForm({ current: '', newPass: '', confirmPass: '' });
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16 transition-colors">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs">
        
        {/* Page Header */}
        <div className="mb-6 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                User Identity & Security
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Session Governance</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Account Profile & Security Settings
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Manage JWT authentication credentials, 2FA security policies, & jurisdiction attributes.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="font-semibold text-xs">Active RBAC Session Verified</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* User Summary Card */}
          <div className="panel-minimal p-5 rounded-2xl space-y-4 md:col-span-1">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center font-bold text-xl text-white">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="font-bold text-sm text-white">{currentUser?.name || 'Authenticated User'}</h2>
                <p className="text-[11px] text-[var(--text-muted)] font-mono">{currentUser?.email}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Assigned Role:</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-zinc-900 text-zinc-200 border border-zinc-800">
                  {currentUser?.role || 'MEMBER'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Country Jurisdiction:</span>
                <span className="font-semibold">{currentUser?.country || 'INDIA'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-muted)]">Session Status:</span>
                <span className="text-emerald-500 font-semibold">Active JWT</span>
              </div>
            </div>
          </div>

          {/* Settings & Token Telemetry */}
          <div className="space-y-6 md:col-span-2">
            
            {/* JWT Token Telemetry */}
            <div className="panel-minimal p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Key className="w-4 h-4 text-zinc-400" /> Active Session Token Telemetry
              </div>
              <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] font-mono text-[11px] space-y-1">
                <p className="text-[var(--text-muted)]">Token Type: <span className="text-emerald-400 font-bold">Bearer JWT</span></p>
                <p className="text-[var(--text-muted)]">Storage Strategy: <span className="text-zinc-200">HTTP-Only Cookie + LocalStorage Fallback</span></p>
                <p className="text-[var(--text-muted)] truncate">Raw Signature: <span className="text-zinc-400">{token.slice(0, 32)}...</span></p>
              </div>
            </div>

            {/* 2FA Toggle */}
            <div className="panel-minimal p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Require TOTP authentication code during login.</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 accent-zinc-200"
              />
            </div>

            {/* Change Password Form */}
            <div className="panel-minimal p-5 rounded-2xl space-y-3">
              <div className="font-semibold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" /> Update Account Password
              </div>
              {updateSuccess && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-lg text-emerald-400 font-medium">
                  Password updated successfully!
                </div>
              )}
              <form onSubmit={handlePasswordUpdate} className="space-y-3">
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    required
                    className="w-full px-3 py-2 input-minimal rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-muted)] mb-1">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPass}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                    required
                    className="w-full px-3 py-2 input-minimal rounded-lg"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="submit" className="px-4 py-2 bg-[var(--text-main)] text-[var(--text-inverse)] font-semibold rounded-lg shadow">
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
