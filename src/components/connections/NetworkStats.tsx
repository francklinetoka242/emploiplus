// src/components/connections/NetworkStats.tsx
import { Users, UserPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface NetworkStatsData {
  followerCount: number;
  followingCount: number;
}

export function NetworkStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['networkStats'],
    queryFn: api.getNetworkStats,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  // Ensure stats values are valid numbers
  const followerCount = Number.isNaN(data?.followerCount) || data?.followerCount === undefined ? 0 : parseInt(data.followerCount, 10);
  const followingCount = Number.isNaN(data?.followingCount) || data?.followingCount === undefined ? 0 : parseInt(data.followingCount, 10);
  const totalNetwork = followerCount + followingCount;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Votre Réseau</h3>

      <div className="space-y-4">
        {/* Followers */}
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Abonnés</p>
            <p className="text-2xl font-bold text-gray-900">{followerCount}</p>
          </div>
        </div>

        {/* Following */}
        <div className="flex items-start gap-4">
          <div className="bg-purple-100 rounded-lg p-3">
            <UserPlus className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Abonnements</p>
            <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100 my-4" />

      {/* Total Network */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-600">Taille du réseau</p>
        <p className="text-lg font-bold text-gray-900">
          {totalNetwork}
        </p>
      </div>
    </div>
  );
}
