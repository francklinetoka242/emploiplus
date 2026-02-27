// src/hooks/useMessaging.ts
import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useMessaging() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [typingUsers, setTypingUsers] = useState<Record<number, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.getConversations(100),
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => api.getUnreadMessageCount(),
    enabled: !!user,
    refetchInterval: 10000,
  });

  // Get messages for a conversation
  const useConversationMessages = (conversationId?: number) => {
    const [offset, setOffset] = useState(0);
    const [allMessages, setAllMessages] = useState<any[]>([]);

    const { data, isFetching } = useQuery({
      queryKey: ['messages', conversationId, offset],
      queryFn: () =>
        conversationId
          ? api.getMessages(conversationId, offset, 20)
          : Promise.resolve([]),
      enabled: !!conversationId,
      refetchInterval: 10000, // Refresh every 10 seconds (no WebSocket yet)
    });

    useEffect(() => {
      if (data) {
        setAllMessages((prev) => (offset === 0 ? data : [data, ...prev]));
      }
    }, [data, offset]);

    const loadMore = useCallback(() => {
      setOffset((prev) => prev + 20);
    }, []);

    return {
      messages: allMessages,
      isFetching,
      loadMore,
      hasMore: data && data.length === 20,
    };
  };

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      receiverId,
      content,
    }: {
      conversationId: number;
      receiverId: number;
      content: string;
    }) => api.sendMessage(conversationId, receiverId, content),
    onSuccess: (data, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => api.markMessageAsRead(messageId),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Mark conversation as read
  const markConversationAsReadMutation = useMutation({
    mutationFn: (conversationId: number) =>
      api.markConversationAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
  });

  // Toggle important
  const toggleImportantMutation = useMutation({
    mutationFn: ({
      messageId,
      currentState,
    }: {
      messageId: number;
      currentState: boolean;
    }) => api.toggleMessageImportant(messageId, !currentState),
    onSuccess: (_, { messageId }) => {
      // Update local cache
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Delete message
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => api.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Report message
  const reportMessageMutation = useMutation({
    mutationFn: ({
      messageId,
      reason,
    }: {
      messageId: number;
      reason: string;
    }) => api.reportMessage(messageId, reason),
    onSuccess: () => {
      // Show success notification
      console.log('Message signalé avec succès');
    },
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: number) =>
      api.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Create conversation
  const createConversationMutation = useMutation({
    mutationFn: ({
      recipientId,
      subjectId,
    }: {
      recipientId: number;
      subjectId?: number;
    }) => api.createConversation(recipientId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Simulate typing indicator (no WebSocket yet)
  const setTyping = useCallback((conversationId: number, isTyping: boolean) => {
    setTypingUsers((prev) => ({
      ...prev,
      [conversationId]: isTyping,
    }));

    // Auto-clear typing after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers((prev) => ({
          ...prev,
          [conversationId]: false,
        }));
      }, 3000);
    }
  }, []);

  // Simulate online status
  const setUserOnline = useCallback((userId: number, isOnline: boolean) => {
    setOnlineUsers((prev) => {
      const newSet = new Set(prev);
      if (isOnline) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  }, []);

  return {
    // Conversations
    conversations,
    unreadCount: unreadData?.count || 0,
    useConversationMessages,
    createConversationMutation,
    deleteConversationMutation,

    // Messages
    sendMessageMutation,
    markAsReadMutation,
    markConversationAsReadMutation,
    toggleImportantMutation,
    deleteMessageMutation,
    reportMessageMutation,

    // Presence
    typingUsers,
    onlineUsers,
    setTyping,
    setUserOnline,
  };
}
