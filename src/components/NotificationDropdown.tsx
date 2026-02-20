import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Trash2, Check } from "lucide-react";
import { authHeaders, buildApiUrl } from '@/lib/headers';
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Notification {
  id: number;
  title?: string;
  message?: string;
  content?: string;
  sender_name?: string;
  sender_profile_image?: string;
  type?: 'like' | 'comment' | 'interview' | 'message' | 'application';
  read: boolean;
  created_at: string;
  publication_id?: number;
  job_id?: number;
  sender_id?: number;
}

export default function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const headers = authHeaders();
      const res = await fetch(buildApiUrl('/notifications'), { headers });
      if (res.ok) {
        const data = await res.json();
        const notifs = data.success ? data.notifications : (Array.isArray(data) ? data : []);
        setNotifications(Array.isArray(notifs) ? notifs : []);
        const unread = (Array.isArray(notifs) ? notifs : []).filter((n: Notification) => !n.read).length || 0;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
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
      console.error("Erreur suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const markAsRead = async (notificationId: number) => {
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
      console.error("Erreur marquage:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.type === 'interview' || notification.type === 'message') {
      navigate(`/company/${notification.sender_id}`, {
        state: { jobId: notification.job_id }
      });
    } else if (notification.publication_id) {
      window.location.hash = `#publication-${notification.publication_id}`;
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-orange-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          
          {/* Dropdown Card */}
          <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold text-lg">
                Notifications {notifications.length > 0 ? `(${notifications.length})` : ""}
              </h3>
            </div>

            {loading && (
              <div className="p-8 text-center text-muted-foreground">
                Chargement...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Aucune notification
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="space-y-2 p-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-3 cursor-pointer transition-colors ${
                      notification.read ? "bg-white" : "bg-orange-50 border-orange-200"
                    } hover:bg-muted`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={notification.sender_profile_image} alt={notification.sender_name} />
                        <AvatarFallback>
                          {(notification.sender_name || "")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">
                          {notification.sender_name}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.content || notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="border-t p-3">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => navigate('/notifications')}
                >
                  Voir toutes les notifications
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
