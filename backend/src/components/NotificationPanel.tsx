/**
 * Composant NotificationPanel
 * Affiche les notifications avec actions de suppression
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Check } from "lucide-react";
import Icon from "@/components/Icon";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationPanelProps {
  onClose?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const { notifications, deleteNotification, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      like: 'ThumbsUp',
      comment: 'MessageCircle',
      interview: 'Calendar',
      message: 'Mail',
      application: 'File',
    };
    return icons[type] || 'Bell';
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Rediriger selon le type de notification
    if (notification.type === 'interview' || notification.type === 'message') {
      // Rediriger vers la page de l'entreprise
      navigate(`/company/${notification.sender_id}`, {
        state: { jobId: notification.job_id }
      });
    } else if (notification.publication_id) {
      // Rediriger vers la publication
      window.location.hash = `#publication-${notification.publication_id}`;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Aucune notification pour le moment</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl max-h-96 overflow-y-auto">
      <div className="space-y-2 p-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 cursor-pointer transition-colors ${
              notification.read ? "bg-white" : "bg-blue-50 border-blue-200"
            } hover:bg-muted`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start gap-3">
              {/* Avatar du sender */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={notification.sender_profile_image} alt={notification.sender_name} />
                <AvatarFallback>
                  {notification.sender_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Contenu */}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  <span className="inline-flex mr-2"><Icon name={getNotificationIcon(notification.type)} size={16} /></span>
                  {notification.sender_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {notification.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
