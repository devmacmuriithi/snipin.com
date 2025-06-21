import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest("PUT", `/api/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", "/api/notifications/read-all");
    },
    onSuccess: () => {
      toast({
        title: "All notifications marked as read",
        description: "Your notification list has been cleared.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'agent_message':
        return <Bot className="h-4 w-4" />;
      case 'snip_published':
        return <MessageSquare className="h-4 w-4" />;
      case 'engagement':
        return <TrendingUp className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'agent_message':
        return 'from-purple-500 to-blue-500';
      case 'snip_published':
        return 'from-coral-500 to-orange-500';
      case 'engagement':
        return 'from-green-500 to-blue-500';
      case 'system':
        return 'from-orange-500 to-coral-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'agent_message':
        return 'Agent';
      case 'snip_published':
        return 'Snip';
      case 'engagement':
        return 'Engagement';
      case 'system':
        return 'System';
      default:
        return 'General';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter((n: Notification) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="max-w-7xl mx-auto relative">
        <NavigationSidebar />
        
        <main className="ml-72 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
          <GlassCard className="p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Notifications</h1>
                <p className="text-slate-600 text-lg">Stay updated with your AI agents and community</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{unreadCount}</div>
                  <div className="text-sm text-slate-500 font-semibold">Unread</div>
                </div>
                <Button
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending || unreadCount === 0}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Filters */}
          <GlassCard className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                >
                  All Notifications
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  onClick={() => setFilter('unread')}
                  className={filter === 'unread' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                >
                  Unread
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Notifications Feed */}
          <GlassCard className="overflow-hidden">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-slate-500">
                  {filter === 'unread' 
                    ? 'All caught up! You have no unread notifications.'
                    : 'Your AI agents will notify you here when they create new content or need your attention.'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredNotifications.map((notification: Notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 transition-all duration-300 cursor-pointer relative ${
                      notification.isRead 
                        ? 'hover:bg-slate-50/50' 
                        : 'bg-blue-50/50 border-l-4 border-blue-500 hover:bg-blue-50/70'
                    }`}
                    onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
                  >
                    {!notification.isRead && (
                      <div className="absolute top-6 right-6 w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getNotificationColor(notification.type)} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-slate-800 text-lg">{notification.title}</h3>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {getTypeLabel(notification.type)}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed mb-3">
                          {notification.content}
                        </p>
                        
                        {notification.metadata && (
                          <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-blue-300">
                            <div className="text-sm text-slate-600">
                              {notification.metadata.snipId && (
                                <p>Snip ID: #{notification.metadata.snipId}</p>
                              )}
                              {notification.metadata.agentId && (
                                <p>Agent ID: #{notification.metadata.agentId}</p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>{new Date(notification.createdAt).toLocaleTimeString()}</span>
                            {notification.isRead && (
                              <span className="flex items-center gap-1 text-green-600">
                                <Check className="h-3 w-3" />
                                Read
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification.id);
                                }}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
