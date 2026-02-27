/**
 * Dashboard Chart Components
 * Reusable chart components for admin dashboard
 */

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { HistoricalData, CategoryBreakdown } from '@/hooks/useDashboardStats';

// ============================================================================
// COLORS & CONSTANTS
// ============================================================================

const CHART_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#22c55e', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];

const PRIMARY_COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
};

// ============================================================================
// LINE CHART - TRENDS
// ============================================================================

interface LineChartProps {
  data: HistoricalData[];
  title: string;
  dataKey: string;
  stroke?: string;
  fill?: string;
}

export function DashboardLineChart({
  data,
  title,
  dataKey,
  stroke = PRIMARY_COLORS.primary,
  fill = PRIMARY_COLORS.primary,
}: LineChartProps) {
  return (
    <Card className="p-6 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            dot={(props) => {
              const { cx, cy } = props;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={3}
                  fill={stroke}
                  opacity={0.6}
                />
              );
            }}
            strokeWidth={2}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// AREA CHART - CUMULATIVE TRENDS
// ============================================================================

interface AreaChartProps {
  data: HistoricalData[];
  title: string;
  dataKey: string;
  fill?: string;
  stroke?: string;
}

export function DashboardAreaChart({
  data,
  title,
  dataKey,
  fill = PRIMARY_COLORS.primary,
  stroke = PRIMARY_COLORS.primary,
}: AreaChartProps) {
  return (
    <Card className="p-6 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            fill={fill}
            stroke={stroke}
            fillOpacity={0.3}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// BAR CHART - COMPARISONS
// ============================================================================

interface BarChartProps {
  data: HistoricalData[];
  title: string;
  dataKeys: Array<{
    key: string;
    fill: string;
    name: string;
  }>;
}

export function DashboardBarChart({
  data,
  title,
  dataKeys,
}: BarChartProps) {
  return (
    <Card className="p-6 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend />
          {dataKeys.map((dataKey) => (
            <Bar
              key={dataKey.key}
              dataKey={dataKey.key}
              fill={dataKey.fill}
              name={dataKey.name}
              isAnimationActive
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// PIE CHART - DISTRIBUTION
// ============================================================================

interface PieChartProps {
  data: CategoryBreakdown[];
  title: string;
}

export function DashboardPieChart({ data, title }: PieChartProps) {
  return (
    <Card className="p-6 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// MULTI-LINE CHART - MULTIPLE METRICS
// ============================================================================

interface MultiLineChartProps {
  data: HistoricalData[];
  title: string;
  lines: Array<{
    dataKey: string;
    stroke: string;
    name: string;
  }>;
}

export function DashboardMultiLineChart({
  data,
  title,
  lines,
}: MultiLineChartProps) {
  return (
    <Card className="p-6 w-full">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">{title}</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.stroke}
              name={line.name}
              strokeWidth={2}
              isAnimationActive
              dot={{ r: 3, opacity: 0.5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// ============================================================================
// CUSTOM HOOKS FOR CHARTS
// ============================================================================

/**
 * Get appropriate chart component based on type
 */
export function ChartFactory({
  type,
  ...props
}: any) {
  switch (type) {
    case 'line':
      return <DashboardLineChart {...props} />;
    case 'area':
      return <DashboardAreaChart {...props} />;
    case 'bar':
      return <DashboardBarChart {...props} />;
    case 'pie':
      return <DashboardPieChart {...props} />;
    case 'multi-line':
      return <DashboardMultiLineChart {...props} />;
    default:
      return null;
  }
}

export { CHART_COLORS, PRIMARY_COLORS };
