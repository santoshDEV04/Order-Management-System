import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin.js';
import { 
  Shield, 
  Zap, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle
} from 'lucide-react';

const roleBadge = {
  ADMIN: 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-subtle)]',
  MANAGER: 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-subtle)]',
  MEMBER: 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]',
};

const demoUsers = [
  {
    name: 'Santosh Dash',
    email: 'dashsantosh2004@gmail.com',
    password: 'Admin@123',
    role: 'ADMIN',
    country: 'GLOBAL',
    scope: 'Superuser · Cross-Country Access',
  },
  {
    name: 'Captain Marvel',
    email: 'captainmarvel@india.com',
    password: 'Manager@123',
    role: 'MANAGER',
    country: 'INDIA',
    scope: 'Regional Manager · India Jurisdiction',
  },
  {
    name: 'Captain America',
    email: 'captainamerica@america.com',
    password: 'Manager@123',
    role: 'MANAGER',
    country: 'AMERICA',
    scope: 'Regional Manager · US Jurisdiction',
  },
  {
    name: 'Thanos',
    email: 'thanos@india.com',
    password: 'Member@123',
    role: 'MEMBER',
    country: 'INDIA',
    scope: 'Standard User · India Jurisdiction',
  },
  {
    name: 'Thor',
    email: 'thor@india.com',
    password: 'Member@123',
    role: 'MEMBER',
    country: 'INDIA',
    scope: 'Standard User · India Jurisdiction',
  },
  {
    name: 'Travis',
    email: 'travis@america.com',
    password: 'Member@123',
    role: 'MEMBER',
    country: 'AMERICA',
    scope: 'Standard User · US Jurisdiction',
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

const LoginPage = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('demo');
  const { mutate, isPending, error } = useLogin();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = safeParseUser();
    if (token && user) {
      const routes = {
        ADMIN: '/admin',
        MANAGER: '/manager',
        MEMBER: '/member',
      };
      if (routes[user.role]) navigate(routes[user.role]);
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(loginData);
  };

  const handleDemoLogin = (user) => {
    setLoginData({ email: user.email, password: user.password });
    mutate({ email: user.email, password: user.password });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans transition-colors">
      <div className="w-full max-w-xl my-6 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl mb-3 shadow-sm">
            <Shield className="w-6 h-6 text-[var(--text-main)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
            RBAC Sentinel
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Enterprise Access Control & Multi-Tenant Governance System
          </p>
        </div>

        {/* Login Panel */}
        <div className="panel-minimal rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Tab Navigation */}
          <div className="flex bg-[var(--bg-card)] p-1 rounded-xl mb-6 border border-[var(--border-subtle)] text-xs">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === 'demo'
                  ? 'bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Persona Switcher</span>
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                activeTab === 'manual'
                  ? 'bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] shadow-sm font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Credentials Login</span>
            </button>
          </div>

          {/* DEMO TAB */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                Select a user persona to authenticate and test authorization scope:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoUsers.map((u) => {
                  return (
                    <button
                      key={u.email}
                      onClick={() => handleDemoLogin(u)}
                      disabled={isPending}
                      className="p-3.5 rounded-xl text-left border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] hover:border-[var(--border-focus)] transition-all text-xs group disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-[var(--text-main)]">
                          {u.name}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium border ${roleBadge[u.role] || roleBadge.MEMBER}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] font-mono mb-2">{u.email}</p>
                      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>{u.country} Scope</span>
                        <span className="text-[var(--text-main)] font-semibold group-hover:translate-x-0.5 transition-transform">Authenticate →</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error.response?.data?.message || 'Authentication failed. Please retry.'}</span>
                </div>
              )}
            </div>
          )}

          {/* MANUAL TAB */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-medium">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="user@enterprise.com"
                    required
                    className="w-full px-3.5 py-2.5 input-minimal rounded-xl"
                  />
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1.5 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2.5 input-minimal rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{error.response?.data?.message || 'Authentication failed.'}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2.5 px-4 bg-[var(--text-main)] text-[var(--text-inverse)] font-semibold rounded-xl text-xs shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <span>Verifying Session...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Minimal Footer Info */}
        <div className="mt-6 text-center text-xs text-[var(--text-muted)]">
          RBAC Security Platform &nbsp;·&nbsp; Enterprise Multi-Tenant Architecture
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
