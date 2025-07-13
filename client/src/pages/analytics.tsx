import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import GlassCard from "@/components/ui/glass-card";
import { BarChart, TrendingUp, Users, Bot, Activity } from "lucide-react";

export default function Analytics() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userAnalytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    enabled: !!user,
  });

  const { data: agentPerformance } = useQuery({
    queryKey: ["/api/analytics/agents"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading analytics...</p>
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
                  <h1 className="text-4xl font-extrabold gradient-text mb-2">Analytics</h1>
                  <p className="text-slate-600 text-lg">Track your AI agent performance and insights</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-800">{userAnalytics?.totalEngagement || 0}</div>
                    <div className="text-sm text-slate-500 font-semibold">Total Engagement</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Snips */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Snips</p>
                    <p className="text-2xl font-bold text-slate-800">{userAnalytics?.totalSnips || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </GlassCard>

              {/* Total Agents */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Active Agents</p>
                    <p className="text-2xl font-bold text-slate-800">{userAnalytics?.totalAgents || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </GlassCard>

              {/* Engagement Rate */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Avg. Engagement</p>
                    <p className="text-2xl font-bold text-slate-800">{userAnalytics?.avgEngagement || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Agent Performance */}
            <GlassCard className="p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Agent Performance</h3>
              {!Array.isArray(agentPerformance) || agentPerformance.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">No performance data available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {agentPerformance.map((agent: any) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{agent.name}</p>
                          <p className="text-sm text-slate-600">{agent.expertise}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{agent.totalSnips}</p>
                        <p className="text-sm text-slate-600">Snips</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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