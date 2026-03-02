// src/components/messaging/ConversationList.tsx
import { useState } from 'react';
import { Conversation } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Trash2 } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: number;
  onSelectConversation: (conversationId: number) => void;
  onDeleteConversation?: (conversationId: number) => void;
  unreadCounts?: Record<number, number>;
  currentUserId: number;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  unreadCounts = {},
  currentUserId,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant =
      conv.participant1_id === currentUserId ? conv.participant2 : conv.participant1;

    return (
      otherParticipant?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      otherParticipant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="animate-spin">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-400"
          />
          <input
            type="text"
            placeholder="Rechercher une conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="font-semibold">Aucune conversation</p>
            <p className="text-sm">Commencez à discuter avec quelqu'un!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const otherParticipant =
              conversation.participant1_id === currentUserId
                ? conversation.participant2
                : conversation.participant1;

            const unreadCount = unreadCounts[conversation.id] || 0;
            const isSelected = selectedConversationId === conversation.id;

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                }`}
              >
                {/* Avatar */}
                {otherParticipant?.profile_image_url ? (
                  <img
                    src={otherParticipant.profile_image_url}
                    alt={otherParticipant.full_name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {otherParticipant?.full_name?.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {otherParticipant?.full_name}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.last_message_at
                        ? formatDistanceToNow(new Date(conversation.last_message_at), {
                            addSuffix: true,
                            locale: fr,
                          })
                        : ''}
                    </span>
                  </div>

                  <p className={`text-sm truncate ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {conversation.lastMessage?.content || 'Aucun message'}
                  </p>
                </div>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                  <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}

                {/* Delete Button (Hover) */}
                {onDeleteConversation && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
