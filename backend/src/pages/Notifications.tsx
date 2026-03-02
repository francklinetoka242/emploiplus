import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { ProfileSidebar } from '@/components/layout/ProfileSidebar';
import { authHeaders } from '@/lib/headers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Trash2, Check } from 'lucide-react';
import { PWALayout } from '@/components/layout/PWALayout';

interface Notification {
  id: number;
  user_id: number;
  type?: string;
  notification_type?: string;
  title?: string;
  message: string;
  sender_id?: number;
  sender_name?: string;
  sender_avatar?: string;
  created_at: string;
  read: boolean;
}

export default function Notifications() {
  const { user } = useAuth();
  const { role } = useUserRole(user);
  const isCandidate = role === 'candidate';
  const isCompany = role === 'company';
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string | null>(null);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const response = await fetch('/api/notifications', {
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: !!user
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete notification');
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  // Filter notifications based on selected type
  const filteredNotifications = filterType
    ? notifications.filter(n => (n.type || n.notification_type) === filterType)
    : notifications;

  // Define filter options based on role
  const candidateFilters = [
    { type: 'application', label: 'Candidatures' },
    { type: 'comment', label: 'Commentaires' },
    { type: 'interview', label: 'Entretiens' }
  ];

  const companyFilters = [
    { type: 'application', label: 'Candidatures reçues' },
    { type: 'interview', label: 'Entretiens programmés' },
    { type: 'comment', label: 'Commentaires' }
  ];

  const activeFilters = isCandidate ? candidateFilters : isCompany ? companyFilters : [];

  return (    <PWALayout notificationCount={0} messageCount={0}>    <div className="min-h-screen bg-gray-50">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <ProfileSidebar />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              </div>
              <p className="text-gray-600">
                Vous avez {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Filter Tabs */}
            {activeFilters.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setFilterType(null)}
                  className={`px-4 py-2 mr-2 rounded-lg text-sm font-medium transition-colors ${
                    filterType === null
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Tous
                </button>
                {activeFilters.map(filter => (
                  <button
                    key={filter.type}
                    onClick={() => setFilterType(filter.type)}
                    className={`px-4 py-2 mr-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === filter.type
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune notification</p>
                </div>
              ) : (
                filteredNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg p-4 border-l-4 ${
                      notification.read
                        ? 'border-gray-200 opacity-75'
                        : 'border-primary'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left section: Avatar, name, and content */}
                      <div className="flex items-start gap-4 flex-1">
                        {/* Avatar or Logo */}
                        <div className="flex-shrink-0">
                          {notification.user_type === 'admin' || !notification.user_type ? (
                            // Admin/Site notification - Show site logo placeholder
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg">
                              EC
                            </div>
                          ) : (
                            // User notification - Show profile image
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={notification.profile_image_url} />
                              <AvatarFallback className="bg-primary text-white font-semibold">
                                {(notification.full_name || notification.company_name || '')
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>

                        {/* Name and content */}
                        <div className="flex-1 min-w-0">
                          {/* Sender name and type */}
                          {(notification.full_name || notification.company_name) && (
                            <div className="mb-2">
                              <p className="font-semibold text-gray-900">
                                {notification.full_name || notification.company_name}
                              </p>
                              {notification.user_type && notification.user_type !== 'admin' && (
                                <p className="text-xs text-gray-500">
                                  {notification.user_type === 'candidate' ? 'Candidat' : notification.user_type === 'company' ? 'Entreprise' : 'Administrateur'}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Notification content */}
                          {notification.title && (
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                          )}
                          <p className="text-gray-700 break-words text-sm">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          title="Delete"
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </PWALayout>
  );
}
