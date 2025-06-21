import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import ActiveConversations from "@/components/dashboard/active-conversations";
import { useToast } from "@/hooks/use-toast";

export default function Messages() {
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
          <p className="text-slate-600 font-semibold">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                  Messages
                </h1>
                <p className="text-slate-600 text-lg font-medium">
                  Active conversations with your AI agents and community members.
                </p>
              </div>
            </div>
          </header>
          
          {/* Messages Content */}
          <div className="grid grid-cols-1 gap-6">
            <ActiveConversations />
          </div>
        </div>
      </main>
    </div>
  );
}