import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  onClick?: () => void;
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

export const StatCard = ({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  onClick,
}: StatCardProps) => {
  return (
    <Card 
      className={`p-6 cursor-pointer transition-all hover:shadow-lg ${colorStyles[color]} ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        {icon && <div className="text-2xl">{icon}</div>}
      </div>
    </Card>
  );
};

export default StatCard;
