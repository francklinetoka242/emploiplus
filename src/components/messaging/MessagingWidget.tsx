// src/components/messaging/MessagingWidget.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MessageCircle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

interface OpenChat {
  conversationId: number;
  position: number; // position from right
}

export function MessagingWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);

  // Fetch conversations
  const { data: conversationsData, isError: conversationsError } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(50),
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30s
    retry: 2,
  });

  // Ensure conversations is always an array
  const conversations = Array.isArray(conversationsData) ? conversationsData : [];

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => api.getUnreadMessageCount(),
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10s
    retry: 2,
  });

  const unreadCount = unreadData?.count || 0;

  const handleOpenChat = (conversationId: number) => {
    // Don't open duplicate chats
    if (!openChats.find((c) => c.conversationId === conversationId)) {
      const position = openChats.length * 320; // 320px width + gap
      setOpenChats((prev) => [...prev, { conversationId, position }]);
    }
  };

  const handleCloseChat = (conversationId: number) => {
    setOpenChats((prev) => prev.filter((c) => c.conversationId !== conversationId));
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Widget Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        >
          <MessageCircle size={24} />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-lg">Messagerie</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-blue-500 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Aucune conversation</p>
                  <p className="text-sm">Commencez à discuter avec quelqu'un!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const otherParticipant =
                      conversation.participant1_id === user.id
                        ? conversation.participant2
                        : conversation.participant1;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleOpenChat(conversation.id)}
                        className="w-full px-4 py-3 hover:bg-gray-100 flex items-center gap-3 text-left transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        {/* Avatar */}
                        {otherParticipant?.profile_image_url ? (
                          <img
                            src={otherParticipant.profile_image_url}
                            alt={otherParticipant.full_name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {otherParticipant?.full_name?.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {otherParticipant?.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'Aucun message'}
                          </p>
                        </div>

                        {/* Status Indicator */}
                        <div className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Open Chat Windows */}
      {openChats.map((chat) => {
        const conversation = conversations.find((c) => c.id === chat.conversationId);
        if (!conversation) return null;

        return (
          <ChatWindow
            key={chat.conversationId}
            conversation={conversation}
            currentUserId={user.id}
            onClose={() => handleCloseChat(chat.conversationId)}
            position={{ x: chat.position, y: 16 }}
          />
        );
      })}
    </>
  );
}
