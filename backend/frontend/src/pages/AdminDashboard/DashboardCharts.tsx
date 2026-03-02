import React from 'react';
import {
  useDashboardHistory,
  DashboardHistory,
} from '../../hooks/useDashboardStats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function SimpleLine({ data, dataKey, stroke, name }: { data: any[]; dataKey: string; stroke: string; name: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} name={name} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const DashboardCharts: React.FC = () => {
  const { data, isLoading, isError } = useDashboardHistory();

  if (isLoading) return <div>Chargement des graphiques...</div>;
  if (isError || !data) return <div>Impossible de charger l'historique</div>;

  // The controller returns arrays of 30 days with `date` and numeric fields
  const registrations = data.user_registrations || [];
  const revenue = data.revenue || [];

  // Prepare datasets: for registrations use `count`, for revenue use `revenue` (number)
  const regData = registrations.map((r: any) => ({ date: r.date, count: Number(r.count || 0) }));
  const revData = revenue.map((r: any) => ({ date: r.date, revenue: Number(r.revenue || 0) }));

  return (
    <div className="dp-charts-grid">
      <div className="dp-chart-card">
        <h3>Évolution des inscriptions (30 jours)</h3>
        <SimpleLine data={regData} dataKey="count" stroke="#2563eb" name="Inscriptions" />
      </div>

      <div className="dp-chart-card">
        <h3>Volume des ventes (30 jours)</h3>
        <SimpleLine data={revData} dataKey="revenue" stroke="#16a34a" name="Revenus" />
      </div>
    </div>
  );
};

export default DashboardCharts;
