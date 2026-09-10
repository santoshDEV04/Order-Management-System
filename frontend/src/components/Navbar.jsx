import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../api/auth.api';
import useLogin from '../hooks/useLogin';
import RbacInspectorModal from './RbacInspectorModal';
import AuditLogStream from './AuditLogStream';
import { 
  Shield, 
  Terminal, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  Globe, 
  Zap, 
  Menu,
  X,
  SlidersHorizontal,
  Sun,
  Moon,
  BarChart3,
  User
} from 'lucide-react';

const demoUsers = [
  {
    name: 'Santosh Dash',
    email: 'dashsantosh2004@gmail.com',
    password: 'Admin@123',
    role: 'ADMIN',
    country: 'GLOBAL',
  },
  {
    name: 'Captain Marvel',
    email: 'captainmarvel@india.com',
    password: 'Manager@123',
    role: 'MANAGER',
    country: 'INDIA',
  },
  {
    name: 'Captain America',
    email: 'captainamerica@america.com',
    password: 'Manager@123',
    role: 'MANAGER',
    country: 'AMERICA',
  },
  {
    name: 'Thanos',
    email: 'thanos@india.com',
    password: 'Member@123',
    role: 'MEMBER',
    country: 'INDIA',
  },
  {
    name: 'Travis',
    email: 'travis@america.com',
    password: 'Member@123',
    role: 'MEMBER',
    country: 'AMERICA',
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

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  
  // Light vs Dark Mode state
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  const dropdownRef = useRef(null);
  const { mutate: loginMutate, isPending: isSwitching } = useLogin();
  const currentUser = safeParseUser();

  // Apply theme class on html element
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  // Close persona menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPersonaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    }
  };

  const handleSwitchPersona = (user) => {
    setIsPersonaMenuOpen(false);
    loginMutate({ email: user.email, password: user.password });
  };

  const getDashboardRoute = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'ADMIN': return '/admin';
      case 'MANAGER': return '/manager';
      case 'MEMBER': return '/member';
      default: return '/';
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-[var(--bg-panel)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo & Main Navigation */}
            <div className="flex items-center gap-6">
              <div
                onClick={() => navigate(getDashboardRoute())}
                className="flex items-center cursor-pointer group gap-2"
              >
                <div className="p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-main)] group-hover:border-[var(--border-focus)] transition-colors">
                  <Shield className="w-5 h-5 text-[var(--text-main)]" />
                </div>
                <h1 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
                  RBAC <span className="text-[var(--text-muted)] font-normal">Sentinel</span>
                </h1>
              </div>

              {/* Navigation Links */}
              {currentUser && (
                <div className="hidden md:flex items-center gap-1 text-xs">
                  <button
                    onClick={() => navigate(getDashboardRoute())}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      ['/admin', '/manager', '/member'].includes(location.pathname)
                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => navigate('/analytics')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/analytics'
                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Analytics
                  </button>

                  <button
                    onClick={() => navigate('/audit-logs')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/audit-logs'
                        ? 'bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" /> Audit Stream
                  </button>
                </div>
              )}
            </div>

            {/* Right Tools */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              
              {/* Theme Toggle */}
              <button
                onClick={() => setIsLightMode(!isLightMode)}
                className="p-2 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors"
                title="Toggle Light/Dark Theme"
              >
                {isLightMode ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => setIsInspectorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <span>Policy Matrix</span>
              </button>

              {/* Persona Switcher Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)] transition-colors font-medium"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Persona Switcher</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${isPersonaMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPersonaMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl shadow-2xl p-1.5 z-50 animate-fade-in">
                    <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] mb-1">
                      <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                        Quick Persona Switch
                      </p>
                    </div>
                    <div className="space-y-0.5 max-h-64 overflow-y-auto">
                      {demoUsers.map((u) => {
                        const isCurrent = currentUser?.email === u.email;
                        return (
                          <button
                            key={u.email}
                            onClick={() => handleSwitchPersona(u)}
                            disabled={isSwitching || isCurrent}
                            className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-[var(--bg-card)] text-[var(--text-main)] font-medium cursor-default'
                                : 'hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-medium text-[var(--text-main)]">{u.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">{u.email}</p>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                              {u.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop User Profile Button */}
              {currentUser && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-panel)] transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <div className="text-right">
                      <p className="font-medium text-[var(--text-main)] leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">{currentUser.role}</p>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-rose-950/20 text-[var(--text-muted)] hover:text-rose-400 border border-[var(--border-subtle)] transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            {currentUser && (
              <div className="md:hidden flex items-center gap-2">
                <button
                  onClick={() => setIsLightMode(!isLightMode)}
                  className="p-2 rounded-lg bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)]"
                >
                  {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-main)]"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {currentUser && isMobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] p-4 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)]">
              <div>
                <p className="font-medium text-[var(--text-main)]">{currentUser.name}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{currentUser.email}</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-[var(--bg-panel)] text-[var(--text-muted)]">
                {currentUser.role}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                onClick={() => { navigate(getDashboardRoute()); setIsMobileMenuOpen(false); }}
                className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => { navigate('/analytics'); setIsMobileMenuOpen(false); }}
                className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg font-medium"
              >
                Analytics
              </button>
              <button
                onClick={() => { navigate('/audit-logs'); setIsMobileMenuOpen(false); }}
                className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg font-medium"
              >
                Audit Stream
              </button>
            </div>

            <button
              onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
              className="w-full py-2 bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-lg flex items-center justify-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Account Profile
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2 bg-[var(--bg-card)] text-rose-400 border border-[var(--border-subtle)] rounded-lg flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        )}
      </nav>

      <RbacInspectorModal
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
      />

      <AuditLogStream
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />
    </>
  );
};

export default Navbar;
