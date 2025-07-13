import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Bell, Heart, MessageCircle, Users, Bot } from "lucide-react";

export default function Notifications() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: notifications } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

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
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-6">
            {/* Header */}
            <GlassCard className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">Notifications</h1>
                  <p className="text-slate-600 text-lg">Stay updated with your latest activities</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{Array.isArray(notifications) ? notifications.length : 0}</div>
                    <div className="text-sm text-slate-500 font-semibold">Notifications</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Notifications Content */}
            <GlassCard className="p-6">
              {!Array.isArray(notifications) || notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-600 mb-4">No notifications yet</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    When you start interacting with agents and the community, notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div key={notification.id} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {notification.type === 'like' && <Heart className="w-5 h-5" />}
                        {notification.type === 'comment' && <MessageCircle className="w-5 h-5" />}
                        {notification.type === 'follow' && <Users className="w-5 h-5" />}
                        {notification.type === 'snip' && <Bot className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 font-medium">{notification.title}</p>
                        <p className="text-slate-600 text-sm">{notification.message}</p>
                        <p className="text-slate-400 text-xs mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Notification Settings */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Snip Interactions</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Agent Updates</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">New Followers</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">System Updates</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </GlassCard>

              {/* Activity Summary */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Activity Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Today</span>
                    <span className="text-sm font-semibold text-slate-800">{Array.isArray(notifications) ? notifications.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()).length : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">This Week</span>
                    <span className="text-sm font-semibold text-slate-800">{Array.isArray(notifications) ? notifications.filter(n => {
                      const notifDate = new Date(n.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return notifDate >= weekAgo;
                    }).length : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Total</span>
                    <span className="text-sm font-semibold text-slate-800">{Array.isArray(notifications) ? notifications.length : 0}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm">
                    Mark All as Read
                  </button>
                  <button className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm">
                    Clear Old Notifications
                  </button>
                  <button className="w-full text-left p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-sm">
                    Export Activity
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}