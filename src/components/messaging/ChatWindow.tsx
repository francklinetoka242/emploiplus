// src/components/messaging/ChatWindow.tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Conversation, Message } from '@/lib/api';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { X, Info, MoreVertical } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: number;
  onClose?: () => void;
  position?: { x: number; y: number };
}

export function ChatWindow({
  conversation,
  currentUserId,
  onClose,
  position,
}: ChatWindowProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const queryClient = useQueryClient();
  const otherParticipant =
    conversation.participant1_id === currentUserId
      ? conversation.participant2
      : conversation.participant1;

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', conversation.id],
    queryFn: () => api.getMessages(conversation.id, 0, 20),
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      return api.sendMessage(
        conversation.id,
        currentUserId,
        otherParticipant?.id!,
        content
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => api.markMessageAsRead(messageId),
  });

  // Toggle important
  const toggleImportantMutation = useMutation({
    mutationFn: (messageId: number) => {
      const msg = messages.find((m) => m.id === messageId);
      return api.toggleMessageImportant(messageId, msg?.is_important || false);
    },
  });

  // Delete message
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => api.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversation.id] });
    },
  });

  // Report message
  const reportMessageMutation = useMutation({
    mutationFn: (messageId: number) => {
      return api.reportMessage(messageId, 'Contenu inapproprié', 'report');
    },
  });

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 right-4 w-80 bg-white border border-gray-300 rounded-t-lg shadow-lg"
        style={position ? { right: position.x, bottom: position.y } : {}}
      >
        <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between rounded-t-lg cursor-pointer hover:from-blue-700 hover:to-blue-800"
          onClick={() => setIsMinimized(false)}
        >
          <span className="font-semibold text-sm">{otherParticipant?.full_name}</span>
          <X size={16} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-0 right-4 w-80 h-96 bg-white border border-gray-300 rounded-t-lg shadow-2xl flex flex-col overflow-hidden"
      style={position ? { right: position.x, bottom: position.y } : {}}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {otherParticipant?.profile_image_url && (
            <img
              src={otherParticipant.profile_image_url}
              alt={otherParticipant.full_name}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {otherParticipant?.full_name}
            </p>
            <p className="text-xs text-blue-100">En ligne</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-blue-500 rounded">
            <Info size={16} />
          </button>
          <button className="p-1 hover:bg-blue-500 rounded">
            <MoreVertical size={16} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <X size={16} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-blue-500 rounded"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
        onToggleImportant={(id, current) =>
          toggleImportantMutation.mutate(id)
        }
        onDelete={(id) => deleteMessageMutation.mutate(id)}
        onReport={(id) => reportMessageMutation.mutate(id)}
      />

      {/* Input */}
      <MessageInput
        onSend={(content) => sendMutation.mutate(content)}
        isLoading={sendMutation.isPending}
      />
    </div>
  );
}
