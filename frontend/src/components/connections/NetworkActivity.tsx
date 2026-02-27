// src/components/connections/NetworkActivity.tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Clock, FileText, Briefcase, Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface Activity {
  id: string;
  type: 'follow' | 'publication' | 'job_posted';
  actor: {
    id: number;
    full_name: string;
    profile_image_url?: string;
    profession?: string;
    user_type: string;
  };
  action: string;
  timestamp: string;
  target?: string;
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'publication':
      return <FileText className="w-5 h-5 text-blue-600" />;
    case 'job_posted':
      return <Briefcase className="w-5 h-5 text-green-600" />;
    case 'follow':
      return <Heart className="w-5 h-5 text-purple-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;

  return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
}

export function NetworkActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['networkActivity'],
    queryFn: () => api.getNetworkActivity(20),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const activityList = (activities || []) as Activity[];

  if (activityList.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Aucune activité pour le moment</p>
        <p className="text-sm text-gray-500 mt-2">Suivez des personnes pour voir leur activité</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-4">Activité du Réseau</h3>

      {activityList.map((activity) => {
        const actor = activity.actor;
        const timeStr = formatTime(activity.timestamp);

        return (
          <Card key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold text-gray-900">{actor.full_name}</span>
                      <span className="text-gray-700"> {activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{actor.profession}</p>
                  </div>

                  {/* Time Badge */}
                  <span className="flex-shrink-0 text-xs text-gray-500 font-medium">{timeStr}</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
