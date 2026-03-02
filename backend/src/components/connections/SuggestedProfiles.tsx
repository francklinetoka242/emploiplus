// src/components/connections/SuggestedProfiles.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User, UserPlus, UserCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';

export interface Suggestion {
  user: {
    id: number;
    full_name: string;
    profile_image_url?: string;
    bio?: string;
    profession?: string;
    user_type: string;
    company_name?: string;
    skills?: string[];
  };
  matchScore: number;
  commonSkills: string[];
  reason: string;
  isFollowing: boolean;
}

export function SuggestedProfiles() {
  const queryClient = useQueryClient();
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['followSuggestions'],
    queryFn: () => api.getFollowSuggestions(12),
  });

  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await api.followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await api.unfollowUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-white rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const suggestedList = (suggestions || []) as Suggestion[];

  if (suggestedList.length === 0) {
    return (
      <Card className="p-8 text-center">
        <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Aucune suggestion disponible pour le moment</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-900 mb-4">Suggestions IA</h3>

      {suggestedList.map((suggestion) => {
        const user = suggestion.user;
        const matchScore = suggestion.matchScore;
        const getMatchColor = (score: number) => {
          if (score >= 75) return 'bg-green-100 text-green-700';
          if (score >= 45) return 'bg-orange-100 text-orange-700';
          return 'bg-gray-100 text-gray-700';
        };

        const matchColorClass = getMatchColor(matchScore);

        return (
          <Card key={user.id} className="p-4 hover:shadow-md transition-shadow">
            {/* Header avec avatar et score */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{user.full_name}</h4>
                  <p className="text-sm text-gray-600 truncate">{user.profession || user.company_name}</p>
                </div>
              </div>

              {/* Match Badge */}
              <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 flex-shrink-0 ${matchColorClass}`}>
                <Zap className="w-4 h-4" />
                {matchScore}%
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{user.bio}</p>
            )}

            {/* Common Skills */}
            {suggestion.commonSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Compétences communes:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestion.commonSkills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {suggestion.commonSkills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      +{suggestion.commonSkills.length - 3} plus
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Reason */}
            <p className="text-xs text-gray-500 mb-3">💡 {suggestion.reason}</p>

            {/* Follow Button */}
            <button
              onClick={() => {
                if (suggestion.isFollowing) {
                  unfollowMutation.mutate(user.id);
                } else {
                  followMutation.mutate(user.id);
                }
              }}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              className={`w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                suggestion.isFollowing
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } disabled:opacity-50`}
            >
              {suggestion.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4" />
                  Suivi
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Suivre
                </>
              )}
            </button>
          </Card>
        );
      })}
    </div>
  );
}
