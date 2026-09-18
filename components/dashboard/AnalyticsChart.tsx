'use client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { AnalyticsPoint } from '@/types';

export default function AnalyticsChart({ data }: { data: AnalyticsPoint[] }) {
  return (
    <div className="w-full h-72" role="img" aria-label="Analytics bar chart for the last 7 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              fontSize: 13,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="views" name="Store Views" fill="#10B981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="carts" name="Cart Additions" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
          <Bar dataKey="clicks" name="WhatsApp Clicks" fill="#F59E0B" radius={[6, 6, 0, 0]} />
          <Bar dataKey="orders" name="Orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}