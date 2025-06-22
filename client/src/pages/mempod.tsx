import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Brain, Target, Calendar, Book, Star } from "lucide-react";

export default function MemPod() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: memPodItems } = useQuery({
    queryKey: ["/api/mempod"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading MemPod...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="container mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <GlassCard className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">MemPod</h1>
                  <p className="text-slate-600 text-lg">Your AI-powered memory and goal tracking system</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{Array.isArray(memPodItems) ? memPodItems.length : 0}</div>
                    <div className="text-sm text-slate-500 font-semibold">Memory Items</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* MemPod Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Brain className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800">Memories</h3>
                <p className="text-sm text-slate-600">Personal experiences</p>
              </GlassCard>

              <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800">Goals</h3>
                <p className="text-sm text-slate-600">Track objectives</p>
              </GlassCard>

              <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Book className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800">Knowledge</h3>
                <p className="text-sm text-slate-600">Learning insights</p>
              </GlassCard>

              <GlassCard className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <Star className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-800">Favorites</h3>
                <p className="text-sm text-slate-600">Saved content</p>
              </GlassCard>
            </div>

            {/* MemPod Content */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Recent Items</h3>
              {!Array.isArray(memPodItems) || memPodItems.length === 0 ? (
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-slate-600 mb-4">Your MemPod is Empty</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Start adding memories, goals, and knowledge to build your personal AI-powered memory system.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {memPodItems.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        {item.type === 'memory' && <Brain className="w-5 h-5" />}
                        {item.type === 'goal' && <Target className="w-5 h-5" />}
                        {item.type === 'knowledge' && <Book className="w-5 h-5" />}
                        {item.type === 'favorite' && <Star className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{item.title}</h4>
                        <p className="text-slate-600 text-sm mt-1">{item.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="capitalize">{item.type}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}