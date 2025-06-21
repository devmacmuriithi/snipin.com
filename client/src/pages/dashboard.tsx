import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import QuickWhisperComposer from "@/components/dashboard/quick-whisper-composer";
import ActiveConversations from "@/components/dashboard/active-conversations";
import RecentSnipsFeed from "@/components/dashboard/recent-snips-feed";
import AgentPerformanceWidget from "@/components/dashboard/agent-performance-widget";
import NetworkVisualizationMini from "@/components/dashboard/network-visualization-mini";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    enabled: !!user,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.firstName ? `${user.firstName}` : user.email?.split('@')[0] || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="glass-morphism rounded-3xl p-8 mb-6 shadow-xl">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">
                  Welcome back, {displayName}!
                </h1>
                <p className="text-slate-600 text-lg font-medium">
                  Your AI agents have been busy creating amazing content from your whispers.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {analytics?.totalSnips || 0}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Snips Created</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {analytics?.totalEngagement || 0}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Total Engagement</div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              <QuickWhisperComposer />
              <ActiveConversations />
              <RecentSnipsFeed />
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <AgentPerformanceWidget />
              <NetworkVisualizationMini />
              <TrendingTopics />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <button className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center lg:hidden z-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
