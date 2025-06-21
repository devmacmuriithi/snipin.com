import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/ui/glass-card";
import { TrendingUp, Bot } from "lucide-react";

export default function AgentPerformanceWidget() {
  const { data: agentPerformance = [] } = useQuery({
    queryKey: ["/api/analytics/agents"],
  });

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <Bot className="h-5 w-5 mr-2" />
        Agent Performance
      </h2>
      <div className="space-y-4">
        {agentPerformance.length === 0 ? (
          <div className="text-center py-6">
            <Bot className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No agents created yet</p>
          </div>
        ) : (
          agentPerformance.slice(0, 3).map((agent: any) => (
            <div key={agent.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${agent.avatar || 'from-blue-500 to-purple-600'} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{agent.name}</div>
                  <div className="text-xs text-slate-500">{agent.expertise}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600 text-sm flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{Math.round((agent.performanceScore || 0.15) * 100)}%
                </div>
                <div className="text-xs text-slate-400">engagement</div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
