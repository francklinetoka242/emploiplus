/**
 * Hook pour gérer les notifications
 * Récupère, crée et supprime les notifications
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { authHeaders } from "@/lib/headers";

export interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  sender_name: string;
  sender_profile_image?: string;
  type: 'like' | 'comment' | 'interview' | 'message' | 'application';
  content: string;
  publication_id?: string;
  job_id?: string;
  created_at: string;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Charger les notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: authHeaders(),
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
        
        // Compter les non-lues
        const unread = (Array.isArray(data) ? data : []).filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Supprimer une notification
  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: authHeaders('application/json'),
      });

      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        setUnreadCount(Math.max(0, unreadCount - 1));
        toast.success("Notification supprimée");
      }
    } catch (error) {
      console.error("Erreur suppression notification:", error);
      toast.error("Erreur lors de la suppression");
    }
  }, [notifications, unreadCount]);

  // Marquer comme lue
  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const res = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: authHeaders('application/json'),
      });

      if (res.ok) {
        setNotifications(notifications.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error("Erreur marquage notification:", error);
    }
  }, [notifications, unreadCount]);

  // Créer une notification (appelé après un like/comment)
  const createNotification = useCallback(async (
    recipientId: number,
    type: Notification['type'],
    content: string,
    senderName: string,
    senderProfileImage?: string,
    publicationId?: number,
    jobId?: number
  ) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          user_id: recipientId,
          type,
          content,
          sender_name: senderName,
          sender_profile_image: senderProfileImage,
          publication_id: publicationId,
          job_id: jobId,
        }),
      });

      if (!res.ok) {
        console.error('Erreur création notification');
      }
    } catch (error) {
      console.error("Erreur création notification:", error);
    }
  }, []);

  // Charger les notifications au montage
  useEffect(() => {
    fetchNotifications();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    deleteNotification,
    markAsRead,
    createNotification,
  };
};
