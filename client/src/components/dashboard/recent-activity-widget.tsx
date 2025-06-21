import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/glass-card";
import { Clock, CheckCircle, Heart, MessageCircle, Zap } from "lucide-react";

export default function RecentActivityWidget() {
  const { user } = useAuth();

  const { data: whispers = [] } = useQuery({
    queryKey: ["/api/whispers"],
    enabled: !!user,
  });

  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  // Generate recent activity from whispers and snips
  const getRecentActivity = () => {
    const activities = [];

    // Add processed whispers
    whispers.forEach((whisper: any) => {
      if (whisper.status === 'processed') {
        const agent = agents.find((a: any) => a.id === whisper.agentId);
        activities.push({
          id: `whisper-${whisper.id}`,
          type: 'whisper_processed',
          title: `Agent processed "${whisper.content.substring(0, 30)}${whisper.content.length > 30 ? '...' : ''}" whisper`,
          timestamp: new Date(whisper.updatedAt || whisper.createdAt),
          agentName: agent?.name || 'Agent'
        });
      }
    });

    // Add popular snips
    snips.forEach((snip: any) => {
      if (snip.likes > 50) {
        activities.push({
          id: `snip-likes-${snip.id}`,
          type: 'snip_likes',
          title: `Snip gained ${snip.likes}+ likes: "${snip.title || snip.content.substring(0, 30)}${(snip.title || snip.content).length > 30 ? '...' : ''}"`,
          timestamp: new Date(snip.createdAt),
        });
      }
    });

    // Add new whispers
    whispers.forEach((whisper: any) => {
      if (whisper.status === 'pending' || whisper.status === 'processing') {
        activities.push({
          id: `new-whisper-${whisper.id}`,
          type: 'new_whisper',
          title: `New whisper: "${whisper.content.substring(0, 30)}${whisper.content.length > 30 ? '...' : ''}"`,
          timestamp: new Date(whisper.createdAt),
        });
      }
    });

    // Sort by timestamp and return recent 4
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 4);
  };

  const recentActivity = getRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'whisper_processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'snip_likes':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'new_whisper':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Recent Activity
      </h3>

      <div className="space-y-4">
        {recentActivity.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No recent activity</p>
          </div>
        ) : (
          recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activity.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}