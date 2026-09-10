import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  Terminal, 
  ShieldAlert, 
  CheckCircle, 
  Lock, 
  Search, 
  Download, 
  Filter, 
  Server,
  FileCode
} from 'lucide-react';

const fullAuditLogs = [
  {
    id: 'LOG-9001',
    timestamp: '2026-09-09 14:02:11',
    user: 'Santosh Dash',
    email: 'dashsantosh2004@gmail.com',
    role: 'ADMIN',
    action: 'GET /api/users/all-users',
    ip: '192.168.1.10',
    status: '200 OK',
    risk: 'LOW',
    details: 'Global user database fetch executed successfully.',
  },
  {
    id: 'LOG-9002',
    timestamp: '2026-09-09 14:04:45',
    user: 'Captain Marvel',
    email: 'captainmarvel@india.com',
    role: 'MANAGER',
    action: 'GET /api/resturants',
    ip: '10.0.4.12',
    status: '200 OK',
    risk: 'LOW',
    details: 'Applied countryFilter: { country: "INDIA" } via middleware.',
  },
  {
    id: 'LOG-9003',
    timestamp: '2026-09-09 14:06:12',
    user: 'Thanos',
    email: 'thanos@india.com',
    role: 'MEMBER',
    action: 'POST /api/orders/ORD-991/place',
    ip: '172.16.0.88',
    status: '403 Forbidden',
    risk: 'HIGH',
    details: 'Access Denied: MEMBER role lacks place_order permission.',
  },
  {
    id: 'LOG-9004',
    timestamp: '2026-09-09 14:08:30',
    user: 'Captain America',
    email: 'captainamerica@america.com',
    role: 'MANAGER',
    action: 'POST /api/orders',
    ip: '192.168.2.55',
    status: '201 Created',
    risk: 'LOW',
    details: 'Draft order created under US jurisdiction scope.',
  },
  {
    id: 'LOG-9005',
    timestamp: '2026-09-09 14:10:05',
    user: 'Travis',
    email: 'travis@america.com',
    role: 'MEMBER',
    action: 'DELETE /api/users/delete-user/651b',
    ip: '172.16.4.19',
    status: '403 Forbidden',
    risk: 'HIGH',
    details: 'Access Denied: MEMBER role cannot delete user accounts.',
  },
];

const AuditLogsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'HIGH'

  const filteredLogs = fullAuditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    
    if (riskFilter === 'LOW') return matchesSearch && log.risk === 'LOW';
    if (riskFilter === 'HIGH') return matchesSearch && log.risk === 'HIGH';
    return matchesSearch;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['ID,Timestamp,User,Role,Action,Status,Risk,Details']
        .concat(
          filteredLogs.map(
            (l) => `${l.id},${l.timestamp},"${l.user}",${l.role},"${l.action}",${l.status},${l.risk},"${l.details}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rbac_audit_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="mb-6 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Security Telemetry
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Middleware Event Stream</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Security Audit Logs & Compliance Stream
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Real-time authorization trace, IP address origin logging, and HTTP error telemetry.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-[var(--text-main)] border border-[var(--border-subtle)] font-medium rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Export Audit Log (CSV)</span>
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 text-xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by user, action, IP, or email..."
              className="w-full pl-9 pr-3 py-2 input-minimal rounded-xl"
            />
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Filter className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)] font-medium">Risk Status:</span>
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'ALL' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-[var(--text-muted)]'
              }`}
            >
              All Events ({fullAuditLogs.length})
            </button>
            <button
              onClick={() => setRiskFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'LOW' ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'text-[var(--text-muted)]'
              }`}
            >
              Allowed (Low Risk)
            </button>
            <button
              onClick={() => setRiskFilter('HIGH')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                riskFilter === 'HIGH' ? 'bg-zinc-800 text-rose-400 border border-zinc-700' : 'text-[var(--text-muted)]'
              }`}
            >
              Blocked (High Risk)
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="panel-minimal rounded-xl overflow-hidden text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-card)] text-[var(--text-muted)] font-medium border-b border-[var(--border-subtle)]">
                <tr>
                  <th className="py-2.5 px-4">Event ID</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User Identity</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Action Endpoint</th>
                  <th className="py-2.5 px-4">IP Address</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-main)]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="py-2.5 px-4 font-mono font-bold text-zinc-400">{log.id}</td>
                    <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">{log.timestamp}</td>
                    <td className="py-2.5 px-4 font-medium">{log.user}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] font-semibold">
                        {log.role}
                      </span>
                    </td>
                    
                    <td className="py-2.5 px-4 font-mono text-zinc-300 font-semibold">{log.action}</td>
                    <td className="py-2.5 px-4 font-mono text-[var(--text-muted)]">{log.ip}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          log.risk === 'LOW'
                            ? 'text-emerald-400 border-emerald-800/40'
                            : 'text-rose-400 border-rose-800/40'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuditLogsPage;
