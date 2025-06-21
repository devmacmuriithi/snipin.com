import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import WelcomeHeader from "@/components/dashboard/welcome-header";
import QuickWhisperComposer from "@/components/dashboard/quick-whisper-composer";
import RecentSnipsFeed from "@/components/dashboard/recent-snips-feed";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="max-w-7xl mx-auto relative">
        <NavigationSidebar />
        
        <main className="ml-72 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <WelcomeHeader />
                <QuickWhisperComposer />
                <RecentSnipsFeed />
              </div>
              
              {/* Right Column - Sidebar Content */}
              <div className="space-y-6">
                <LiveActivity />
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
    </div>
  );
}