import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLogin from '../hooks/useLogin.js';
import { register as registerApi } from '../api/auth.api.js';
import { Shield, Zap, Mail, Eye, EyeOff, ArrowRight, UserPlus, Sun, Moon, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { RoleBadge, Badge } from '../components/ui/Badge';
import ErrorMessage from '../components/ui/ErrorMessage';
import { useTheme } from '../context/ThemeContext.jsx';

const demoUsers = [
  {
    name: 'Santosh Dash',
    email: 'dashsantosh2004@gmail.com',
    password: 'Admin@123',
    role: 'ADMIN',
    country: 'INDIA',
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

export const LoginPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'manual' | 'register'
  const { mutate, isPending, error } = useLogin();

  // Registration State
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    country: 'INDIA',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = safeParseUser();
    if (token && user) {
      const routes = { ADMIN: '/admin', MANAGER: '/manager', MEMBER: '/member' };
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setIsRegistering(true);

    try {
      // Default role is always enforced as MEMBER
      const payload = {
        name: registerData.name.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
        country: registerData.country,
      };

      const res = await registerApi(payload);
      setRegisterSuccess(
        `Account created successfully! You are registered as a MEMBER with ${registerData.country} jurisdiction.`
      );
      // Pre-fill login credentials
      setLoginData({
        email: registerData.email.trim(),
        password: registerData.password,
      });
      // Reset form
      setRegisterData({ name: '', email: '', password: '', country: 'INDIA' });
    } catch (err) {
      setRegisterError(
        err.response?.data?.message || err.message || 'Registration failed. Please check your details.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative">
      {/* Absolute Top-Right Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          className="p-2.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-focus)] transition-colors cursor-pointer shadow-sm flex items-center gap-2 text-xs"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline font-medium">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline font-medium">Light Mode</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-xl my-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl mb-3 shadow-sm">
            <Shield className="w-6 h-6 text-[var(--text-main)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-main)]">
            RBAC Sentinel
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Enterprise Multi-Role Food Delivery & Authorization Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="panel-minimal rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          {/* Tab Selector - 3 Tabs */}
          <div className="flex bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs gap-1">
            <button
              onClick={() => {
                setActiveTab('demo');
                setRegisterError('');
                setRegisterSuccess('');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'demo'
                  ? 'bg-[var(--bg-panel)] text-[var(--text-main)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Persona</span> Quick Switcher
            </button>
            <button
              onClick={() => {
                setActiveTab('manual');
                setRegisterError('');
                setRegisterSuccess('');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-[var(--bg-panel)] text-[var(--text-main)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setRegisterError('');
                setRegisterSuccess('');
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[var(--bg-panel)] text-[var(--text-main)] font-semibold shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
              <span>Register</span>
            </button>
          </div>

          {error && activeTab !== 'register' && (
            <ErrorMessage
              title="Authentication Failed"
              message={error.response?.data?.message || 'Invalid email or password.'}
            />
          )}

          {/* Persona Switcher View */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--text-muted)]">
                Click any persona below to authenticate with their verified JWT credentials and scope:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoUsers.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => handleDemoLogin(u)}
                    disabled={isPending}
                    className="p-3.5 rounded-xl text-left border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] hover:border-[var(--border-focus)] transition-all text-xs group disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-[var(--text-main)]">{u.name}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] font-mono mb-2">{u.email}</p>
                    <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                      <span>{u.country} Scope</span>
                      <span className="text-[var(--text-main)] font-semibold group-hover:translate-x-0.5 transition-transform">
                        Authenticate →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Manual Login View */}
          {activeTab === 'manual' && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-3.5 pr-9 py-2.5 input-minimal rounded-xl"
                  />
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-3.5 pr-9 py-2.5 input-minimal rounded-xl"
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

              <Button
                type="submit"
                className="w-full py-2.5 mt-2"
                isLoading={isPending}
                icon={ArrowRight}
              >
                Sign In
              </Button>
            </form>
          )}

          {/* Register Member View */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              {registerSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{registerSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('manual');
                      setRegisterSuccess('');
                    }}
                    className="font-semibold text-[11px] underline hover:opacity-80 block cursor-pointer"
                  >
                    Click here to Sign In with your credentials →
                  </button>
                </div>
              )}

              {registerError && (
                <ErrorMessage
                  title="Registration Error"
                  message={registerError}
                />
              )}

              {/* Default Role Banner */}
              <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-[var(--text-main)]">Role Assignment:</span>
                    <RoleBadge role="MEMBER" />
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Default role is MEMBER · Access to country-scoped catalog & ordering
                  </p>
                </div>
                <Badge variant="neutral">Default</Badge>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tony Stark"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 input-minimal rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="member@jurisdiction.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full pl-3.5 pr-9 py-2.5 input-minimal rounded-xl"
                  />
                  <Mail className="w-4 h-4 text-[var(--text-muted)] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full pl-3.5 pr-9 py-2.5 input-minimal rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-3 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[var(--text-muted)] mb-1 font-medium">Country Jurisdiction (ABAC Scope)</label>
                <select
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                  className="w-full px-3.5 py-2.5 input-minimal rounded-xl cursor-pointer"
                >
                  <option value="INDIA">India (₹ INR Scope)</option>
                  <option value="AMERICA">America ($ USD Scope)</option>
                </select>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Determines which regional restaurants, menu prices, and currencies you can view.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 mt-2"
                isLoading={isRegistering}
                icon={UserPlus}
              >
                Register as Member
              </Button>
            </form>
          )}
        </div>

        <div className="mt-5 text-center text-xs text-[var(--text-muted)] font-mono">
          RBAC Sentinel · Express Middleware · MongoDB Data Scoping
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
