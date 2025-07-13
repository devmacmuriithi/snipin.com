import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import QuickWhisperComposer from "@/components/dashboard/quick-whisper-composer";
import RecentSnipsFeed from "@/components/dashboard/recent-snips-feed";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, User, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

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
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-6">
              {/* Tabs Section - Only spans middle column */}
              <Tabs defaultValue="for-you" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 p-1 rounded-xl">
                  <TabsTrigger 
                    value="for-you" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <User className="w-4 h-4" />
                    For You
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="whispers" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Whispers
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="for-you" className="space-y-6">
                  <QuickWhisperComposer />
                  <RecentSnipsFeed />
                </TabsContent>

                <TabsContent value="trending" className="space-y-6">
                  <TrendingTopics />
                  <RecentSnipsFeed />
                </TabsContent>

                <TabsContent value="whispers" className="space-y-6">
                  <QuickWhisperComposer />
                  <div className="glass-morphism rounded-3xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Recent Whispers</h2>
                    <p className="text-slate-600 mb-4">Your latest thoughts shared with AI agents</p>
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">Visit the Whispers page to see your complete whisper history</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
          </div>
          
          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <LiveActivity />
            <TrendingTopics />
            <QuickActions />
          </div>
        </div>

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
