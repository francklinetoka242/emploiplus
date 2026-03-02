// src/pages/Messages.tsx
import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatWindow } from '@/components/messaging/ChatWindow';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PWALayout } from '@/components/layout/PWALayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>();
  const [showNewChat, setShowNewChat] = useState(false);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(100),
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch suggested users for new conversations
  const { data: suggestedUsers = [], isLoading: suggestedLoading } = useQuery({
    queryKey: ['suggestedUsersForChat'],
    queryFn: async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await fetch(`${apiUrl}/api/users/suggestions?limit=8`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data || data || [];
      } catch {
        return [];
      }
    },
    enabled: !!user && showNewChat,
  });

  // Fetch unread counts
  const { data: unreadCountsData = {} } = useQuery({
    queryKey: ['unreadCounts'],
    queryFn: async () => {
      const counts: Record<number, number> = {};
      for (const conversation of conversations) {
        const data = await api.getUnreadMessageCount();
        counts[conversation.id] = data.count;
      }
      return counts;
    },
    enabled: !!user && conversations.length > 0,
    refetchInterval: 10000,
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: (userId: number) => api.createConversation(userId),
    onSuccess: (data) => {
      refetchConversations();
      setSelectedConversationId(data.id);
      setShowNewChat(false);
    },
  });

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 px-2 py-2">
      {/* Header */}
      

      {/* Content */}
      <div className="flex-1 flex min-h-0">
        {/* Conversations List - Desktop */}
        <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
            onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
            unreadCounts={unreadCountsData}
            currentUserId={user.id}
            isLoading={conversationsLoading}
          />
        </div>

        {/* Mobile: Conversations or Chat */}
        <div className="flex-1 md:hidden bg-white flex flex-col">
          {!selectedConversationId ? (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onDeleteConversation={(id) => deleteConversationMutation.mutate(id)}
              unreadCounts={unreadCountsData}
              currentUserId={user.id}
              isLoading={conversationsLoading}
            />
          ) : (
            selectedConversation && (
              <ChatWindowPage
                conversation={selectedConversation}
                currentUserId={user.id}
                onBack={() => setSelectedConversationId(undefined)}
              />
            )
          )}
        </div>

        {/* Chat Window - Desktop */}
        <div className="hidden md:flex-1 md:flex md:bg-gray-50 md:p-6 md:flex-col">
          {selectedConversation ? (
            <ChatWindowDesktop
              conversation={selectedConversation}
              currentUserId={user.id}
            />
          ) : (
            <StartConversationPanel 
              showNewChat={showNewChat}
              setShowNewChat={setShowNewChat}
              suggestedUsers={suggestedUsers}
              suggestedLoading={suggestedLoading}
              onSelectUser={(userId) => createConversationMutation.mutate(userId)}
              isCreating={createConversationMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Desktop Chat Window (full-screen mode)
function ChatWindowDesktop({ conversation, currentUserId }: any) {
  return (
    <div className="w-full bg-white rounded-lg shadow-sm flex flex-col">
      <ChatWindow
        conversation={conversation}
        currentUserId={currentUserId}
        onClose={() => {}}
        position={{ x: 0, y: 0 }}
      />
    </div>
  );
}

// Start Conversation Panel - for when no conversation is selected
function StartConversationPanel({
  showNewChat,
  setShowNewChat,
  suggestedUsers,
  suggestedLoading,
  onSelectUser,
  isCreating,
}: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
      {!showNewChat ? (
        <div className="text-center max-w-md">
          <div className="mb-6 flex justify-center">
            <div className="p-4 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commencez à discuter</h2>
          <p className="text-gray-600 mb-6">Sélectionnez une conversation existante ou créez une nouvelle conversation.</p>
          <Button 
            onClick={() => setShowNewChat(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle conversation
          </Button>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Sélectionnez un contact</h3>
            <button
              onClick={() => setShowNewChat(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          {suggestedLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : suggestedUsers.length > 0 ? (
            <div className="space-y-2">
              {suggestedUsers.map((user: any) => (
                <Card 
                  key={user.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer border transition-colors"
                  onClick={() => onSelectUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profile_image_url} />
                      <AvatarFallback>{user.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.profession || 'Utilisateur'}</p>
                    </div>
                    {isCreating && (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Aucun utilisateur disponible</p>
              <Button 
                variant="outline"
                onClick={() => setShowNewChat(false)}
                className="mt-4"
              >
                Retour
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}// Mobile Chat Window
function ChatWindowPage({ conversation, currentUserId, onBack }: any) {
  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <p className="font-semibold">
            {conversation.participant1_id === currentUserId
              ? conversation.participant2?.full_name
              : conversation.participant1?.full_name}
          </p>
          <p className="text-xs text-gray-500">En ligne</p>
        </div>
      </div>

      {/* Chat Content */}
      <ChatWindow
        conversation={conversation}
        currentUserId={currentUserId}
        onClose={() => {}}
        position={{ x: 0, y: 0 }}
      />
    </div>
  );
}
