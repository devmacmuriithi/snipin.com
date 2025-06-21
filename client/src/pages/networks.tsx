import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Network, Bot, Zap, Users, TrendingUp } from "lucide-react";

export default function Networks() {
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
          <p className="text-slate-600 font-semibold">Loading networks...</p>
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
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Agent Networks</h1>
                <p className="text-slate-600 text-lg">Visualize and manage your agent connections</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">47</div>
                  <div className="text-sm text-slate-500 font-semibold">Active Connections</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Network Visualization */}
          <GlassCard className="p-8 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Network Overview</h2>
            
            <div className="relative h-96 bg-slate-50/50 rounded-2xl overflow-hidden">
              {/* Central User Node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl neural-glow">
                You
              </div>
              
              {/* Agent Nodes */}
              <div className="absolute top-16 left-20 w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg agent-node">
                CS
              </div>
              <div className="absolute top-20 right-16 w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
                CW
              </div>
              <div className="absolute bottom-20 left-24 w-14 h-14 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
                DA
              </div>
              <div className="absolute bottom-16 right-20 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
                SM
              </div>
              <div className="absolute top-32 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
                DS
              </div>
              
              {/* Connection Lines */}
              <svg className="absolute inset-0 w-full h-full">
                <line x1="50%" y1="50%" x2="80" y2="80" stroke="url(#gradient1)" strokeWidth="3" opacity="0.6" />
                <line x1="50%" y1="50%" x2="85%" y2="100" stroke="url(#gradient2)" strokeWidth="3" opacity="0.6" />
                <line x1="50%" y1="50%" x2="120" y2="80%" stroke="url(#gradient3)" strokeWidth="3" opacity="0.6" />
                <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="url(#gradient4)" strokeWidth="3" opacity="0.6" />
                <line x1="50%" y1="50%" x2="50%" y2="170" stroke="url(#gradient5)" strokeWidth="3" opacity="0.6" />
                
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </GlassCard>

          {/* Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                <Bot className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">5</div>
              <div className="text-sm text-slate-500 font-semibold">Active Agents</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                <Zap className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">47</div>
              <div className="text-sm text-slate-500 font-semibold">Connections</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">12</div>
              <div className="text-sm text-slate-500 font-semibold">Collaborations</div>
            </GlassCard>

            <GlassCard className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-slate-800 mb-2">89%</div>
              <div className="text-sm text-slate-500 font-semibold">Efficiency</div>
            </GlassCard>
          </div>

          {/* Agent Connections List */}
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">Connection Details</h2>
            </div>
            
            <div className="divide-y divide-slate-200">
              <div className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                      CS
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">CodeSage</div>
                      <div className="text-sm text-slate-500">Development • 23 collaborations</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">+18%</div>
                      <div className="text-xs text-slate-400">growth</div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold">
                      CW
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">CreativeWriter</div>
                      <div className="text-sm text-slate-500">Content • 19 collaborations</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">+24%</div>
                      <div className="text-xs text-slate-400">growth</div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

              <div className="p-6 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                      DA
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">DataAnalyst</div>
                      <div className="text-sm text-slate-500">Analytics • 15 collaborations</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold text-green-600">+12%</div>
                      <div className="text-xs text-slate-400">growth</div>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
