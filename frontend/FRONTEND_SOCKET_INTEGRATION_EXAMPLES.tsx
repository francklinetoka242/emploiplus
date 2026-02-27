/**
 * ============================================================================
 * FRONTEND INTEGRATION EXAMPLES - Socket.io & Webhooks
 * ============================================================================
 * 
 * Exemples pour intégrer les services backend dans votre application React/Vue
 */

// ============================================================================
// 1. SOCKET.IO CLIENT SETUP
// ============================================================================

// src/services/socket.ts

import { io, Socket } from 'socket.io-client';

// ✅ Utilise le domaine réel en production
const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://emploiplus-group.com';

// Get JWT token from localStorage/session
const getAuthToken = () => localStorage.getItem('authToken') || '';

// =========================================================================
// MESSAGES SOCKET (Private Conversations)
// =========================================================================

export const messagesSocket: Socket = io(`${SOCKET_URL}/messages`, {
  auth: {
    token: getAuthToken(),
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
});

// =========================================================================
// NOTIFICATIONS SOCKET (Broadcasts)
// =========================================================================

export const notificationsSocket: Socket = io(`${SOCKET_URL}/notifications`, {
  auth: {
    token: getAuthToken(),
  },
  reconnection: true,
  transports: ['websocket', 'polling'],
});

// =========================================================================
// PRESENCE SOCKET (Online Status)
// =========================================================================

export const presenceSocket: Socket = io(`${SOCKET_URL}/presence`, {
  auth: {
    token: getAuthToken(),
  },
  reconnection: true,
  transports: ['websocket', 'polling'],
});

// ============================================================================
// 2. MESSAGING HOOKS (React)
// ============================================================================

// src/hooks/useMessages.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { messagesSocket } from '@/services/socket';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderEmail: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface TypingUser {
  userId: string;
  email: string;
  isTyping: boolean;
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Join conversation room
  useEffect(() => {
    if (!conversationId) return;

    messagesSocket.emit('join_conversation', { conversationId });
    setIsConnected(messagesSocket.connected);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [conversationId]);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== data.userId);
        return data.isTyping ? [...filtered, data] : filtered;
      });
    };

    const handleMessageSent = (data: { id: string; timestamp: string }) => {
      // Optimistic update confirmation
      setMessages(prev =>
        prev.map(m => (m.id === 'pending' ? { ...m, id: data.id } : m))
      );
    };

    messagesSocket.on('new_message', handleNewMessage);
    messagesSocket.on('user_typing', handleUserTyping);
    messagesSocket.on('message_sent', handleMessageSent);

    return () => {
      messagesSocket.off('new_message', handleNewMessage);
      messagesSocket.off('user_typing', handleUserTyping);
      messagesSocket.off('message_sent', handleMessageSent);
    };
  }, []);

  // Send message
  const sendMessage = useCallback((content: string) => {
    if (!conversationId) return;

    // Optimistic update
    const optimisticMessage: Message = {
      id: 'pending',
      conversationId,
      senderId: 'me',
      senderEmail: 'my-email@example.com',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages(prev => [...prev, optimisticMessage]);

    messagesSocket.emit('send_message', {
      conversationId,
      recipientId: 'recipient-id', // Get from context
      content,
    });
  }, [conversationId]);

  // Typing indicator
  const setIsTyping = useCallback((isTyping: boolean) => {
    if (!conversationId) return;

    messagesSocket.emit('typing', {
      conversationId,
      isTyping,
    });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  }, [conversationId]);

  // Mark messages as read
  const markAsRead = useCallback((messageIds: string[]) => {
    messagesSocket.emit('mark_as_read', { messageIds });
  }, []);

  // Delete message
  const deleteMessage = useCallback((messageId: string) => {
    messagesSocket.emit('delete_message', { messageId });
  }, []);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    setIsTyping,
    markAsRead,
    deleteMessage,
  };
}

// ============================================================================
// 3. NOTIFICATIONS HOOK
// ============================================================================

// src/hooks/useNotifications.ts

import { useEffect, useState, useCallback } from 'react';
import { notificationsSocket } from '@/services/socket';

interface Notification {
  title: string;
  body: string;
  data?: Record<string, any>;
  timestamp: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev =>
          prev.filter(n => n.timestamp !== notification.timestamp)
        );
      }, 5000);
    };

    notificationsSocket.on('notification', handleNotification);

    return () => {
      notificationsSocket.off('notification', handleNotification);
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, clearNotifications };
}

// ============================================================================
// 4. PRESENCE HOOK
// ============================================================================

// src/hooks/usePresence.ts

import { useEffect, useState } from 'react';
import { presenceSocket } from '@/services/socket';

interface OnlineUser {
  userId: string;
  email: string;
  timestamp: number;
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    const handleUserOnline = (user: OnlineUser) => {
      setOnlineUsers(prev => [...prev, user]);
    };

    const handleUserOffline = (data: { userId: string }) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    };

    presenceSocket.on('user_online', handleUserOnline);
    presenceSocket.on('user_offline', handleUserOffline);

    return () => {
      presenceSocket.off('user_online', handleUserOnline);
      presenceSocket.off('user_offline', handleUserOffline);
    };
  }, []);

  const isUserOnline = (userId: string) =>
    onlineUsers.some(u => u.userId === userId);

  return { onlineUsers, isUserOnline };
}

// ============================================================================
// 5. CHAT COMPONENT EXAMPLE
// ============================================================================

// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { usePresence } from '@/hooks/usePresence';

interface ChatWindowProps {
  conversationId: string;
  recipientName: string;
  recipientId: string;
}

export function ChatWindow({ 
  conversationId, 
  recipientName,
  recipientId 
}: ChatWindowProps) {
  const { 
    messages, 
    typingUsers, 
    sendMessage, 
    setIsTyping,
    markAsRead 
  } = useMessages(conversationId);
  
  const { isUserOnline } = usePresence();
  
  const [inputValue, setInputValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark visible messages as read
  useEffect(() => {
    const unreadMessageIds = messages
      .filter(m => !m.isRead && m.senderId !== 'me')
      .map(m => m.id);

    if (unreadMessageIds.length > 0) {
      markAsRead(unreadMessageIds);
    }
  }, [messages, markAsRead]);

  // Typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (!isComposing) {
      setIsTyping(true);
      setIsComposing(true);
    }
  };

  const handleInputBlur = () => {
    setIsTyping(false);
    setIsComposing(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue('');
    setIsTyping(false);
    setIsComposing(false);
  };

  const isRecipientTyping = typingUsers.some(u => u.userId === recipientId);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">{recipientName}</h2>
          <p className="text-sm text-gray-500">
            {isUserOnline(recipientId) ? '🟢 Online' : '⚫ Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === 'me' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.senderId === 'me'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isRecipientTyping && (
          <div className="flex items-center space-x-2 text-gray-500">
            <span className="text-sm">{recipientName} is typing...</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t px-6 py-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// 6. NOTIFICATIONS TOAST EXAMPLE
// ============================================================================

// src/components/NotificationToast.tsx

import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationToast() {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className="bg-blue-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm animate-slide-in"
        >
          <h3 className="font-semibold">{notification.title}</h3>
          <p className="text-sm text-blue-100">{notification.body}</p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 7. USAGE EXAMPLE IN APP
// ============================================================================

// src/App.tsx

import React, { useState } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { NotificationToast } from '@/components/NotificationToast';

export function App() {
  const [selectedConversation, setSelectedConversation] = useState<string>('conv-123');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        {/* Conversation list */}
      </div>

      {/* Main chat area */}
      <div className="flex-1">
        {selectedConversation && (
          <ChatWindow
            conversationId={selectedConversation}
            recipientName="John Doe"
            recipientId="user-456"
          />
        )}
      </div>

      {/* Notifications toast */}
      <NotificationToast />
    </div>
  );
}

// ============================================================================
// 8. JOB MATCHING NOTIFICATIONS
// ============================================================================

// src/hooks/useJobNotifications.ts

import { useEffect } from 'react';
import { notificationsSocket } from '@/services/socket';
import { useNotifications } from './useNotifications';

export function useJobNotifications() {
  const { notifications } = useNotifications();

  useEffect(() => {
    const handleJobNotification = (data: {
      title: string;
      body: string;
      jobId: string;
    }) => {
      console.log('New job matching notification:', data);
      // The useNotifications hook will automatically display it
    };

    notificationsSocket.on('notification', handleJobNotification);

    return () => {
      notificationsSocket.off('notification', handleJobNotification);
    };
  }, []);

  return { notifications };
}

// Usage in component:
/*
function CandidateDashboard() {
  const { notifications } = useJobNotifications();

  return (
    <div>
      <h1>My Opportunities</h1>
      {notifications.map(n => (
        <JobCard
          key={n.timestamp}
          title={n.title}
          body={n.body}
          jobId={n.data?.jobId}
        />
      ))}
    </div>
  );
}
*/

// ============================================================================
// 9. ERROR HANDLING
// ============================================================================

// src/services/socketErrors.ts

import { messagesSocket, notificationsSocket } from './socket';

export function setupSocketErrorHandling() {
  [messagesSocket, notificationsSocket].forEach(socket => {
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      // Show error toast to user
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      // Handle error
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      // Show offline indicator
    });

    socket.on('reconnect', () => {
      console.log('Socket reconnected');
      // Hide offline indicator
    });
  });
}

// Call in app initialization:
// setupSocketErrorHandling();

export {};
