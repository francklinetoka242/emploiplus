// src/components/messaging/MessageList.tsx
import { useEffect, useRef } from 'react';
import { Message } from '@/lib/api';
import { Star, Trash2, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageListProps {
  messages: Message[];
  currentUserId: number;
  onMarkAsRead?: (messageId: number) => void;
  onToggleImportant?: (messageId: number, current: boolean) => void;
  onDelete?: (messageId: number) => void;
  onReport?: (messageId: number) => void;
}

export function MessageList({
  messages,
  currentUserId,
  onMarkAsRead,
  onToggleImportant,
  onDelete,
  onReport,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Aucun message. Commencez la conversation!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
            onMouseEnter={() => {
              if (!message.is_read && onMarkAsRead) {
                onMarkAsRead(message.id);
              }
            }}
          >
            <div
              className={`group max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                isOwn
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-900 rounded-bl-none'
              } ${!message.is_read && !isOwn ? 'font-semibold' : ''} relative`}
            >
              {/* Message content */}
              <p className="break-words text-sm leading-relaxed">{message.content}</p>

              {/* Timestamp */}
              <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-600'}`}>
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </p>

              {/* Actions Menu (hover) */}
              <div
                className={`absolute bottom-0 ${isOwn ? 'right-0 -right-24' : 'left-0 -left-24'} hidden group-hover:flex gap-2 p-2`}
              >
                {onToggleImportant && (
                  <button
                    onClick={() => onToggleImportant(message.id, message.is_important)}
                    className={`p-1 rounded hover:bg-gray-300 ${
                      message.is_important ? 'text-yellow-500' : 'text-gray-500'
                    }`}
                    title="Marquer comme important"
                  >
                    <Star size={14} fill={message.is_important ? 'currentColor' : 'none'} />
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => onReport(message.id)}
                    className="p-1 rounded hover:bg-gray-300 text-red-500"
                    title="Signaler"
                  >
                    <Flag size={14} />
                  </button>
                )}
                {onDelete && isOwn && (
                  <button
                    onClick={() => onDelete(message.id)}
                    className="p-1 rounded hover:bg-gray-300 text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {/* Unread indicator */}
              {!message.is_read && !isOwn && (
                <div className="absolute -left-2 -top-2 w-3 h-3 bg-blue-600 rounded-full" />
              )}

              {/* Important indicator */}
              {message.is_important && (
                <div className="absolute -right-2 -top-2 text-yellow-500">
                  <Star size={12} fill="currentColor" />
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
