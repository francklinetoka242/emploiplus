// src/pages/Connections.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PWALayout } from '@/components/layout/PWALayout';
import { Loader } from '@/components/ui/loader';
import { NetworkStats } from '@/components/connections/NetworkStats';
import { SuggestedProfiles } from '@/components/connections/SuggestedProfiles';
import { NetworkActivity } from '@/components/connections/NetworkActivity';
import { Network, Users, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface Candidate {
  id: number;
  full_name: string;
  profession?: string;
  email: string;
  phone?: string;
  profile_image_url?: string;
  is_verified?: boolean;
  created_at: string;
}

interface UserWithFollowStatus extends Candidate {
  isFollowing?: boolean;
}

export function Connections() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Fetch all candidates/users
  const { data: candidates = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidates'],
    queryFn: () => api.getCandidates(100),
    enabled: !!user,
  });

  // Check following status for each candidate
  const followingQuery = useQuery({
    queryKey: ['followingUsers'],
    queryFn: () => api.getFollowingUsers(),
    enabled: !!user,
  });

  const followingUsers = followingQuery.data || [];

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await api.followUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
      queryClient.invalidateQueries({ queryKey: ['followSuggestions'] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await api.unfollowUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followingUsers'] });
      queryClient.invalidateQueries({ queryKey: ['networkStats'] });
      queryClient.invalidateQueries({ queryKey: ['followSuggestions'] });
    },
  });

  // Enrich candidates with following status
  const usersWithStatus: UserWithFollowStatus[] = candidates.map((candidate) => ({
    ...candidate,
    isFollowing: followingUsers.some((fu: UserWithFollowStatus) => fu.id === candidate.id),
  }));

  // Filter candidates based on search
  const filteredUsers = usersWithStatus.filter((user) =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.profession || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate followed and not followed
  const notFollowedUsers = filteredUsers.filter(u => !u.isFollowing);
  const followedUsers = filteredUsers.filter(u => u.isFollowing);

  if (authLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Veuillez vous connecter pour accéder à vos connexions</p>
        </div>
      </div>
    );
  }

  return (
    <PWALayout notificationCount={0} messageCount={0}>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     

      {/* Main Content - 3 Columns Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Network Stats & Suggested */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-4 space-y-6">
              <NetworkStats />
              <SuggestedProfiles />
            </div>
          </div>

          {/* Center/Right Columns: Browse Users */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher des professionnels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Followed Users Section */}
            {followedUsers.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Personnes que vous suivez ({followedUsers.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {followedUsers.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isFollowing={true}
                      onFollowClick={() => unfollowMutation.mutate(profile.id)}
                      isLoading={unfollowMutation.isPending}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Available Profiles Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {searchQuery ? 'Résultats de recherche' : 'Découvrir des professionnels'} ({notFollowedUsers.length})
                </h2>
              </div>

              {candidatesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : notFollowedUsers.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    {searchQuery
                      ? 'Aucun professionnel trouvé'
                      : 'Tous les professionnels disponibles sont déjà suivis'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {searchQuery
                      ? 'Essayez une autre recherche'
                      : 'Consultez les suggestions personnalisées à gauche'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notFollowedUsers.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isFollowing={false}
                      onFollowClick={() => followMutation.mutate(profile.id)}
                      isLoading={followMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Activity Section */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité du réseau</h2>
              <div className="sticky top-4">
                <NetworkActivity />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PWALayout>
  );
}

interface ProfileCardProps {
  profile: UserWithFollowStatus;
  isFollowing: boolean;
  onFollowClick: () => void;
  isLoading: boolean;
}

function ProfileCard({ profile, isFollowing, onFollowClick, isLoading }: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header Background */}
      <div className="h-24 bg-gradient-to-r from-purple-500 to-blue-500" />

      {/* Avatar */}
      <div className="px-4 relative">
        <div className="-mt-12 mb-3">
          {profile.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={profile.full_name}
              className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-white bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <h3 className="font-semibold text-gray-900 truncate">{profile.full_name}</h3>
        {profile.profession && (
          <p className="text-sm text-gray-600 truncate">{profile.profession}</p>
        )}
        {profile.is_verified && (
          <p className="text-xs text-green-600 font-medium mt-1">✓ Vérifié</p>
        )}

        {/* Follow Button */}
        <button
          onClick={onFollowClick}
          disabled={isLoading}
          className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors ${
            isFollowing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          } disabled:opacity-50`}
        >
          {isFollowing ? 'Suivi ✓' : '+ Suivre'}
        </button>
      </div>
    </div>
  );
}
