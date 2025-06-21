import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/glass-card";
import { Trophy, Heart, MessageCircle, Share } from "lucide-react";

export default function TopPerformingSnipsWidget() {
  const { user } = useAuth();

  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  // Sort snips by engagement score and get top 5
  const getTopSnips = () => {
    return snips
      .map((snip: any) => ({
        ...snip,
        engagementScore: (snip.likes || 0) + (snip.comments || 0) * 2 + (snip.shares || 0) * 3
      }))
      .sort((a: any, b: any) => b.engagementScore - a.engagementScore)
      .slice(0, 5);
  };

  const topSnips = getTopSnips();

  const getRankIcon = (rank: number) => {
    const colors = [
      'bg-blue-500',
      'bg-blue-400', 
      'bg-blue-400',
      'bg-blue-300',
      'bg-blue-300'
    ];
    return colors[rank - 1] || 'bg-gray-400';
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <Trophy className="h-5 w-5 mr-2" />
        Top Performing Snips
      </h3>

      <div className="space-y-4">
        {topSnips.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No snips available yet</p>
          </div>
        ) : (
          topSnips.map((snip: any, index: number) => (
            <div key={snip.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
              <div className={`w-8 h-8 ${getRankIcon(index + 1)} rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 mb-1 line-clamp-2">
                  {snip.title || snip.content.substring(0, 50) + (snip.content.length > 50 ? '...' : '')}
                </h4>
                
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Heart className="h-3 w-3" />
                    <span>{snip.likes || 0} likes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{snip.comments || 0} replies</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share className="h-3 w-3" />
                    <span>{snip.shares || 0} reshares</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}