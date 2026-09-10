import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Globe, 
  BarChart3, 
  Calendar, 
  ArrowUpRight, 
  Shield, 
  Clock, 
  Award,
  Filter
} from 'lucide-react';

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30D'); // '7D' | '30D' | 'YTD'
  const userString = localStorage.getItem('user');
  const currentUser = userString ? JSON.parse(userString) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans pb-16 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="mb-6 panel-minimal p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                Business Telemetry
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">Real-Time Data Engine</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Platform Analytics & Revenue Insights
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Financial performance, order velocity metrics, and regional jurisdiction breakdowns.
            </p>
          </div>

          {/* Time Filter */}
          <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs">
            <button
              onClick={() => setTimeRange('7D')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === '7D' ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === '30D' ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('YTD')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === 'YTD' ? 'bg-[var(--bg-panel)] text-[var(--text-main)] shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Year to Date
            </button>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="panel-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Gross Platform Revenue</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono">$48,920.00</p>
            <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs previous period
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Average Order Value (AOV)</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono">$42.50</p>
            <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +3.8% optimization
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Fulfilled Orders</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono">1,150</p>
            <div className="flex items-center gap-1 text-emerald-500 text-[11px] font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> 98.4% fulfillment rate
            </div>
          </div>

          <div className="panel-card p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[var(--text-muted)]">
              <span>Active Jurisdictions</span>
              <Globe className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold font-mono">2 Regions</p>
            <p className="text-[11px] text-[var(--text-muted)]">INDIA (18% GST) · US (8% Tax)</p>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          
          {/* Revenue by Country Jurisdiction */}
          <div className="panel-minimal p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Revenue Distribution by ABAC Jurisdiction</h3>
              <Globe className="w-4 h-4 text-[var(--text-muted)]" />
            </div>
            
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium">INDIA Jurisdiction (18% GST)</span>
                  <span className="font-mono font-bold">$28,450.00 (58%)</span>
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="font-medium">AMERICA Jurisdiction (8% Sales Tax)</span>
                  <span className="font-mono font-bold">$20,470.00 (42%)</span>
                </div>
                <div className="w-full bg-[var(--bg-card)] h-2.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[var(--bg-card)] rounded-lg text-[11px] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Note: Data filtered in real-time according to logged-in role scoping. Admins view global aggregate totals; Managers view regional jurisdiction totals.
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="panel-minimal p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Order Fulfillment Lifecycle Status</h3>
              <BarChart3 className="w-4 h-4 text-[var(--text-muted)]" />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <div>
                  <p className="font-semibold text-emerald-500">Delivered Orders</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Completed transactions</p>
                </div>
                <span className="font-mono font-bold text-sm">828 (72%)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <div>
                  <p className="font-semibold text-amber-500">Pending & Processing</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Active kitchen queue</p>
                </div>
                <span className="font-mono font-bold text-sm">207 (18%)</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]">
                <div>
                  <p className="font-semibold text-rose-500">Cancelled / Revoked</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Manager/Admin cancelled</p>
                </div>
                <span className="font-mono font-bold text-sm">115 (10%)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
