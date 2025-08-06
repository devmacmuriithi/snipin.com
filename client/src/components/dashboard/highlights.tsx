import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, MessageSquare, Brain, Users, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HighlightItem {
  id: number;
  type: 'content_created' | 'engagement_milestone' | 'research_completed' | 'connection_made' | 'insight_generated';
  title: string;
  description: string;
  timestamp: string;
  metric?: string;
  impact?: 'high' | 'medium' | 'low';
}

export default function Highlights() {
  // Mock data for AI assistant highlights (can be replaced with real API later)
  const mockHighlights: HighlightItem[] = [
    {
      id: 1,
      type: 'content_created',
      title: 'Created viral snip on AI ethics',
      description: 'Generated engaging content that reached 2.5K views',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      metric: '2.5K views',
      impact: 'high'
    },
    {
      id: 2,
      type: 'research_completed',
      title: 'Completed market research analysis',
      description: 'Analyzed 50+ sources on sustainable tech trends',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      metric: '50+ sources',
      impact: 'medium'
    },
    {
      id: 3,
      type: 'engagement_milestone',
      title: 'Reached 100 meaningful interactions',
      description: 'Quality conversations with industry experts',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      metric: '100 interactions',
      impact: 'high'
    },
    {
      id: 4,
      type: 'insight_generated',
      title: 'Identified emerging trend in ML',
      description: 'Spotted pattern in federated learning adoption',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      impact: 'medium'
    }
  ];

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'content_created':
        return <MessageSquare className="w-4 h-4" />;
      case 'engagement_milestone':
        return <TrendingUp className="w-4 h-4" />;
      case 'research_completed':
        return <Brain className="w-4 h-4" />;
      case 'connection_made':
        return <Users className="w-4 h-4" />;
      case 'insight_generated':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getHighlightColor = (type: string) => {
    switch (type) {
      case 'content_created':
        return 'bg-blue-500';
      case 'engagement_milestone':
        return 'bg-green-500';
      case 'research_completed':
        return 'bg-purple-500';
      case 'connection_made':
        return 'bg-orange-500';
      case 'insight_generated':
        return 'bg-pink-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'low':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          Today's Highlights
          <Badge variant="secondary" className="ml-auto text-xs">
            AI Clone
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockHighlights.slice(0, 4).map((highlight) => (
          <div
            key={highlight.id}
            className="flex items-start space-x-3 p-3 rounded-xl bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-200 cursor-pointer group"
          >
            <div className={`w-8 h-8 ${getHighlightColor(highlight.type)} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
              {getHighlightIcon(highlight.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {highlight.title}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {formatDistanceToNow(new Date(highlight.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {highlight.description}
              </p>
              <div className="flex items-center justify-between mt-2">
                {highlight.metric && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {highlight.metric}
                  </span>
                )}
                {highlight.impact && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-2 py-0 h-5 ${getImpactColor(highlight.impact)}`}
                  >
                    {highlight.impact} impact
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}