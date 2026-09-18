'use client';
import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { AnalyticsPoint } from '@/types';

const RANGES = [7, 14, 30];

export default function AdminSignupsChart({ data }: { data: AnalyticsPoint[] }) {
  const [range, setRange] = useState(14);
  const series = useMemo(() => {
    const slice = data.slice(-range);
    return slice.map((p) => ({ ...p, day: p.day.slice(5) }));
  }, [data, range]);
  const hasData = data.some((p) => p.orders > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900">New Sellers</h2>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                range === r ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {hasData ? (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="orders" name="New sellers" stroke="#10B981" strokeWidth={2} fill="url(#signupGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-sm text-slate-400 py-16 text-center">No signups in this period yet.</p>
      )}
    </div>
  );
}