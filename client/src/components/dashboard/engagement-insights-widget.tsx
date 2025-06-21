import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/glass-card";
import { BarChart3, MoreHorizontal } from "lucide-react";

export default function EngagementInsightsWidget() {
  const { user } = useAuth();

  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  // Calculate engagement metrics
  const calculateEngagementMetrics = () => {
    if (snips.length === 0) {
      return {
        avgLikes: 0,
        avgReplies: 0,
        avgReshares: 0
      };
    }

    const totalLikes = snips.reduce((sum: number, snip: any) => sum + (snip.likes || 0), 0);
    const totalReplies = snips.reduce((sum: number, snip: any) => sum + (snip.comments || 0), 0);
    const totalReshares = snips.reduce((sum: number, snip: any) => sum + (snip.shares || 0), 0);

    return {
      avgLikes: Number((totalLikes / snips.length).toFixed(1)),
      avgReplies: Number((totalReplies / snips.length).toFixed(1)),
      avgReshares: Number((totalReshares / snips.length).toFixed(1))
    };
  };

  const metrics = calculateEngagementMetrics();
  const maxValue = Math.max(metrics.avgLikes, metrics.avgReplies, metrics.avgReshares, 30);

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Engagement Insights
        </h3>
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5 text-slate-500" />
        </button>
      </div>

      {/* Metrics Display */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.avgLikes}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Avg Likes<br />Per Snip
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.avgReplies}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Avg Replies<br />Per Snip
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {metrics.avgReshares}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Avg<br />Reshares<br />Per Snip
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="relative">
        <div className="flex items-end justify-center space-x-8 h-32">
          {/* Likes Bar */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-24 bg-slate-100 rounded-lg overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-blue-500 rounded-lg transition-all duration-700 ease-out flex items-end justify-center"
                style={{ height: `${getBarHeight(metrics.avgLikes)}%` }}
              >
                {metrics.avgLikes > 0 && (
                  <span className="text-white text-xs font-bold mb-1">
                    {metrics.avgLikes}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-slate-600 mt-2 font-medium">Likes</span>
          </div>

          {/* Replies Bar */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-24 bg-slate-100 rounded-lg overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-green-500 rounded-lg transition-all duration-700 ease-out flex items-end justify-center"
                style={{ height: `${getBarHeight(metrics.avgReplies)}%` }}
              >
                {metrics.avgReplies > 0 && (
                  <span className="text-white text-xs font-bold mb-1">
                    {metrics.avgReplies}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-slate-600 mt-2 font-medium">Replies</span>
          </div>

          {/* Reshares Bar */}
          <div className="flex flex-col items-center">
            <div className="relative w-12 h-24 bg-slate-100 rounded-lg overflow-hidden">
              <div 
                className="absolute bottom-0 w-full bg-purple-500 rounded-lg transition-all duration-700 ease-out flex items-end justify-center"
                style={{ height: `${getBarHeight(metrics.avgReshares)}%` }}
              >
                {metrics.avgReshares > 0 && (
                  <span className="text-white text-xs font-bold mb-1">
                    {metrics.avgReshares}
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs text-slate-600 mt-2 font-medium">Reshares</span>
          </div>
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-24 flex flex-col justify-between text-xs text-slate-400 -ml-8">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>0</span>
        </div>
      </div>
    </GlassCard>
  );
}