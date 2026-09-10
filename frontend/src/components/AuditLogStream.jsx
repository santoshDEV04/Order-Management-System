import React, { useState, useEffect } from 'react';
import { Terminal, Check, Lock, X, Trash2, Filter } from 'lucide-react';

const initialLogs = [
  {
    id: 1,
    timestamp: '14:02:11',
    user: 'Santosh Dash',
    role: 'ADMIN',
    action: 'view_all_users',
    status: 'ALLOWED',
    country: 'GLOBAL',
    details: 'Queried system user records without country restriction.',
  },
  {
    id: 2,
    timestamp: '14:04:45',
    user: 'Captain Marvel',
    role: 'MANAGER',
    action: 'get_restaurants',
    status: 'ALLOWED',
    country: 'INDIA',
    details: 'Applied countryFilter: { country: "INDIA" } via middleware.',
  },
  {
    id: 3,
    timestamp: '14:06:12',
    user: 'Thanos',
    role: 'MEMBER',
    action: 'place_order',
    status: 'BLOCKED',
    country: 'INDIA',
    details: 'HTTP 403 Forbidden: MEMBER role lacks place_order permission.',
  },
  {
    id: 4,
    timestamp: '14:08:30',
    user: 'Captain America',
    role: 'MANAGER',
    action: 'create_order',
    status: 'ALLOWED',
    country: 'AMERICA',
    details: 'Created draft order #ORD-8921 under US jurisdiction.',
  },
];

const AuditLogStream = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState(initialLogs);
  const [filter, setFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALLOWED') return log.status === 'ALLOWED';
    if (filter === 'BLOCKED') return log.status === 'BLOCKED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans text-xs">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden flex flex-col text-[var(--text-main)]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[var(--bg-card)] border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-muted)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-main)] tracking-tight">
                Security & Audit Log Telemetry
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Real-time authorization middleware event trace
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

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] text-[11px]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">Filter Logs:</span>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'ALL' ? 'bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('ALLOWED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'ALLOWED' ? 'bg-[var(--bg-main)] text-emerald-500 border border-[var(--border-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Allowed ({logs.filter((l) => l.status === 'ALLOWED').length})
            </button>
            <button
              onClick={() => setFilter('BLOCKED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'BLOCKED' ? 'bg-[var(--bg-main)] text-rose-500 border border-[var(--border-subtle)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Blocked ({logs.filter((l) => l.status === 'BLOCKED').length})
            </button>
          </div>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 text-zinc-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Logs Feed */}
        <div className="p-6 overflow-y-auto flex-1 space-y-2.5 font-mono text-[11px] bg-[var(--bg-main)]">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">No log entries found.</div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-panel)] font-sans space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)] font-mono text-[10px]">{log.timestamp}</span>
                    <span className="font-semibold text-[var(--text-main)]">{log.user}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {log.role}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-main)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      {log.country}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                      log.status === 'ALLOWED'
                        ? 'bg-zinc-900 text-emerald-400 border-emerald-900/60'
                        : 'bg-zinc-900 text-rose-400 border-rose-900/60'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] font-mono text-[11px]">Action: <span className="font-bold">{log.action}</span></p>
                <p className="text-[var(--text-muted)] text-[11px]">{log.details}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[var(--bg-card)] border-t border-[var(--border-subtle)] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg text-xs transition-colors"
          >
            Close Feed
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuditLogStream;
