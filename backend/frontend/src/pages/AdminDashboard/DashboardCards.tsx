import React from 'react';
import { useDashboardStats, formatNumber, formatCurrency } from '../../hooks/useDashboardStats';

const StatCard: React.FC<{label: string; value: string | number; color?: string}> = ({ label, value, color = '#3b82f6' }) => {
  return (
    <div className="dp-stat-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="dp-stat-label">{label}</div>
      <div className="dp-stat-value">{value}</div>
    </div>
  );
};

export const DashboardCards: React.FC = () => {
  const { data, isLoading, isError } = useDashboardStats();

  if (isLoading) return <div>Chargement des statistiques...</div>;
  if (isError || !data) return <div>Impossible de charger les statistiques</div>;

  return (
    <div className="dp-cards-grid">
      <StatCard label="Utilisateurs totaux" value={formatNumber(data.total_users || 0)} color="#2563eb" />
      <StatCard label="Offres actives" value={formatNumber(data.total_active_jobs || 0)} color="#f97316" />
      <StatCard label="Revenus (mois)" value={formatCurrency(Number(data.monthly_revenue || 0))} color="#16a34a" />
      <StatCard label="Formations en cours" value={formatNumber(data.total_formations || 0)} color="#7c3aed" />
    </div>
  );
};

export default DashboardCards;
