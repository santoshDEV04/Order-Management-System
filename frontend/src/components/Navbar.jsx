import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/auth.api.js';
import useLogin from '../hooks/useLogin.js';
import { Shield, LogOut, ChevronDown, User, Sun, Moon } from 'lucide-react';
import { RoleBadge, Badge } from './ui/Badge.jsx';
import Button from './ui/Button.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const demoAccounts = [
  {
    name: 'Santosh Dash',
    email: 'dashsantosh2004@gmail.com',
    password: 'Admin@123',
    role: 'ADMIN',
    country: 'INDIA',
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

export const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme } = useTheme();
  const { mutate: switchLogin, isPending: isSwitching } = useLogin();
  const currentUser = safeParseUser();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleSwitch = (acc) => {
    setIsOpen(false);
    switchLogin({ email: acc.email, password: acc.password });
  };

  const getHomeRoute = () => {
    if (!currentUser) return '/';
    if (currentUser.role === 'ADMIN') return '/admin';
    if (currentUser.role === 'MANAGER') return '/manager';
    return '/member';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--bg-panel)] border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Brand */}
        <div
          onClick={() => navigate(getHomeRoute())}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-main)]">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm text-[var(--text-main)]">Resturant Order and Management System</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2 hidden sm:inline">
              Backend Demonstration
            </span>
          </div>
        </div>

        {/* Right Session & Persona Controls */}
        <div className="flex items-center gap-2.5">
          {/* Persona Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              disabled={isSwitching}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs hover:border-[var(--border-focus)] transition-colors cursor-pointer text-[var(--text-main)]"
            >
              <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">Switch Persona:</span>
              <span className="font-semibold text-xs">{currentUser?.name?.split(' ')[0] || 'Select'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl shadow-xl p-1.5 z-50 animate-fade-in text-xs">
                <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1 font-mono">
                  Seeded Backend Accounts
                </div>
                <div className="space-y-0.5">
                  {demoAccounts.map((acc) => {
                    const isCurrent = currentUser?.email === acc.email;
                    return (
                      <button
                        key={acc.email}
                        onClick={() => handleSwitch(acc)}
                        disabled={isCurrent || isSwitching}
                        className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-[var(--bg-card)] text-[var(--text-main)] font-semibold'
                            : 'hover:bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{acc.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">{acc.country} Scope</p>
                        </div>
                        <RoleBadge role={acc.role} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Current User Info */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)] text-xs">
              <RoleBadge role={currentUser.role} />
              <Badge variant="neutral">{currentUser.country || 'GLOBAL'}</Badge>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle light/dark theme"
            title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
            className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--border-focus)] transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            icon={LogOut}
            title="Logout"
            className="text-zinc-400 hover:text-rose-400"
          />
        </div>

      </div>
    </header>
  );
};

export default Navbar;
