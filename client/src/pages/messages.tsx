import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import GlassCard from "@/components/ui/glass-card";
import { Mail, MessageCircle, Users, Clock } from "lucide-react";

export default function Messages() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading messages...</p>
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
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">Messages</h1>
                  <p className="text-slate-600 text-lg">Chat with your AI agents and community</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{Array.isArray(conversations) ? conversations.length : 0}</div>
                    <div className="text-sm text-slate-500 font-semibold">Conversations</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Messages Content */}
            <GlassCard className="p-12 text-center">
              <Mail className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-600 mb-4">Messages Coming Soon</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Connect and chat with your AI agents and other users in the community.
              </p>
            </GlassCard>
          </div>
          
          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <LiveActivity />
            <TrendingTopics />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}