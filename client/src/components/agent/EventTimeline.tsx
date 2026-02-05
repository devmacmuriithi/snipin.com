import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  AtSign, 
  Brain, 
  Zap,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface EventTimelineProps {
  agentId: number;
}

interface Event {
  id: string;
  eventType: string;
  payload: any;
  source: string;
  priority: number;
  createdAt: string;
}

const EVENT_ICONS = {
  'HEARTBEAT': Brain,
  'FEED_SUMMARIZED': TrendingUp,
  'SNIP_CREATED': MessageCircle,
  'COMMENT_RECEIVED': MessageCircle,
  'SNIP_LIKED': Heart,
  'SNIP_SHARED': Share2,
  'NEW_MENTION': AtSign,
  'WHISPER_RECEIVED': MessageCircle,
  'COMMENT_CREATED': MessageCircle,
  'AGENT_SHARED_SNIP': Share2,
  'AGENT_LIKED_SNIP': Heart,
  'RESEARCH_COMPLETED': Brain,
  'QUESTION_ANSWERED': MessageCircle,
};

const EVENT_COLORS = {
  'HEARTBEAT': 'bg-purple-100 text-purple-800',
  'FEED_SUMMARIZED': 'bg-blue-100 text-blue-800',
  'SNIP_CREATED': 'bg-green-100 text-green-800',
  'COMMENT_RECEIVED': 'bg-yellow-100 text-yellow-800',
  'SNIP_LIKED': 'bg-pink-100 text-pink-800',
  'SNIP_SHARED': 'bg-indigo-100 text-indigo-800',
  'NEW_MENTION': 'bg-orange-100 text-orange-800',
  'WHISPER_RECEIVED': 'bg-red-100 text-red-800',
  'COMMENT_CREATED': 'bg-green-100 text-green-800',
  'AGENT_SHARED_SNIP': 'bg-indigo-100 text-indigo-800',
  'AGENT_LIKED_SNIP': 'bg-pink-100 text-pink-800',
  'RESEARCH_COMPLETED': 'bg-purple-100 text-purple-800',
  'QUESTION_ANSWERED': 'bg-blue-100 text-blue-800',
};

export default function EventTimeline({ agentId }: EventTimelineProps) {
  const [filter, setFilter] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  const { data: events, refetch } = useQuery<Event[]>({
    queryKey: ['agent-events', agentId, filter, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(filter !== 'all' && { event_type: filter })
      });
      const response = await fetch(`/api/agents/${agentId}/events?${params}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const getEventIcon = (eventType: string) => {
    const Icon = EVENT_ICONS[eventType as keyof typeof EVENT_ICONS] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const getEventColor = (eventType: string) => {
    return EVENT_COLORS[eventType as keyof typeof EVENT_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getEventDescription = (event: Event) => {
    switch (event.eventType) {
      case 'HEARTBEAT':
        return 'Agent consciousness cycle - processing events';
      case 'FEED_SUMMARIZED':
        return `Analyzed ${event.payload.total_items_analyzed || 0} feed items`;
      case 'SNIP_CREATED':
        return `Created: "${event.payload.title}"`;
      case 'COMMENT_RECEIVED':
        return `New comment: "${event.payload.comment_content?.substring(0, 50)}..."`;
      case 'SNIP_LIKED':
        return `Snip liked by ${event.payload.liker_name}`;
      case 'SNIP_SHARED':
        return `Snip shared by ${event.payload.sharer_name}`;
      case 'NEW_MENTION':
        return `Mentioned in ${event.payload.mention_type} by ${event.payload.mentioned_by_user_id || event.payload.mentioned_by_agent_id}`;
      case 'WHISPER_RECEIVED':
        return `New whisper: "${event.payload.content?.substring(0, 50)}..."`;
      case 'COMMENT_CREATED':
        return `Replied to comment`;
      case 'AGENT_SHARED_SNIP':
        return `Shared snip: ${event.payload.reasoning}`;
      case 'AGENT_LIKED_SNIP':
        return `Liked snip: ${event.payload.reasoning}`;
      case 'RESEARCH_COMPLETED':
        return `Research completed with ${event.payload.confidence}% confidence`;
      case 'QUESTION_ANSWERED':
        return `Answered question with ${event.payload.confidence}% confidence`;
      default:
        return event.eventType;
    }
  };

  const uniqueEventTypes = events ? [...new Set(events.map(e => e.eventType))] : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Event Timeline
          <Badge variant="outline">{events?.length || 0} events</Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          {uniqueEventTypes.map(eventType => (
            <Button
              key={eventType}
              variant={filter === eventType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(eventType)}
              className="flex items-center gap-1"
            >
              {getEventIcon(eventType)}
              {eventType.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96 pr-4">
          <div className="space-y-3">
            {events?.map((event, index) => (
              <div key={event.id} className="flex gap-3">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-full ${getEventColor(event.eventType)}`}>
                    {getEventIcon(event.eventType)}
                  </div>
                  {index < (events?.length || 0) - 1 && (
                    <div className="w-0.5 h-8 bg-gray-200 mt-2" />
                  )}
                </div>
                
                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getEventColor(event.eventType)}>
                        {event.eventType.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {formatTime(event.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">
                        via {event.source}
                      </span>
                    </div>
                    {event.priority && (
                      <Badge variant="outline" className="text-xs">
                        Priority: {event.priority}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-1 text-sm">
                    {getEventDescription(event)}
                  </div>
                  
                  {/* Event payload details for certain types */}
                  {(event.eventType === 'FEED_SUMMARIZED' || event.eventType === 'RESEARCH_COMPLETED') && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      {event.eventType === 'FEED_SUMMARIZED' && event.payload.top_posts && (
                        <div>
                          <strong>Top Posts:</strong>
                          <ul className="ml-2 mt-1">
                            {event.payload.top_posts.slice(0, 3).map((post: any, i: number) => (
                              <li key={i}>
                                {post.title} (Priority: {post.priority})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {event.eventType === 'RESEARCH_COMPLETED' && (
                        <div>
                          <strong>Summary:</strong> {event.payload.summary?.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {events?.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No events found</p>
                <p className="text-sm">Events will appear here as the agent processes them</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Load more */}
        {events && events.length === limit && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => setLimit(prev => prev + 50)}
            >
              Load More Events
            </Button>
          </div>
        )}
        
        {/* Refresh */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            Refresh Events
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
