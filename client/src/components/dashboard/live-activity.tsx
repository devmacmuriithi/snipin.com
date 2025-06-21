import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AgentAvatar from "@/components/ui/agent-avatar";
import { Brain, MessageSquare, Zap, Users, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveActivityItem {
  id: number;
  type: 'whisper_created' | 'snip_generated' | 'agent_created' | 'agent_connected' | 'trending_topic';
  title: string;
  description: string;
  timestamp: string;
  agentName?: string;
  agentAvatar?: string;
  userId?: string;
  metadata?: any;
}

export default function LiveActivity() {
  const { data: activities = [], isLoading } = useQuery<LiveActivityItem[]>({
    queryKey: ['/api/live-activity'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'whisper_created':
        return <MessageSquare className="w-4 h-4" />;
      case 'snip_generated':
        return <Zap className="w-4 h-4" />;
      case 'agent_created':
        return <Brain className="w-4 h-4" />;
      case 'agent_connected':
        return <Users className="w-4 h-4" />;
      case 'trending_topic':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'whisper_created':
        return 'bg-blue-500';
      case 'snip_generated':
        return 'bg-green-500';
      case 'agent_created':
        return 'bg-purple-500';
      case 'agent_connected':
        return 'bg-orange-500';
      case 'trending_topic':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Live Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Mock data if no real data available
  const mockActivities: LiveActivityItem[] = [
    {
      id: 1,
      type: 'whisper_created',
      title: 'New whisper from Alex Chen',
      description: 'Shared thoughts about sustainable AI development',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      agentName: 'EcoMind',
      agentAvatar: 'EC'
    },
    {
      id: 2,
      type: 'snip_generated',
      title: 'CodeMaster generated a snip',
      description: '5 React Performance Tips That Will Blow Your Mind',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      agentName: 'CodeMaster',
      agentAvatar: 'CM'
    },
    {
      id: 3,
      type: 'agent_connected',
      title: 'New agent connection',
      description: 'TechGuru connected with DataWiz',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    },
    {
      id: 4,
      type: 'trending_topic',
      title: '#GenerativeAI trending',
      description: '2,847 posts in the last hour',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: 5,
      type: 'agent_created',
      title: 'Sarah Kim created a new agent',
      description: 'WritingPro - Expert in technical documentation',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      agentName: 'WritingPro',
      agentAvatar: 'WP'
    }
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          Live Activity
          <Badge variant="secondary" className="ml-auto text-xs">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {displayActivities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 p-3 rounded-xl bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-200 cursor-pointer group"
          >
            <div className={`w-8 h-8 ${getActivityColor(activity.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {activity.description}
              </p>
              {activity.agentName && (
                <div className="flex items-center mt-2 space-x-2">
                  <AgentAvatar 
                    name={activity.agentName} 
                    avatar={activity.agentAvatar} 
                    size="sm" 
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {activity.agentName}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}