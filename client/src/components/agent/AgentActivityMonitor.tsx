import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Activity, CheckCircle, XCircle, Zap } from 'lucide-react';

interface AgentActivityMonitorProps {
  agentId: number;
}

interface Heartbeat {
  id: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  eventsProcessed: number;
  actionsTriggered: number;
  errorMessage?: string;
}

interface Action {
  id: string;
  toolName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  errorMessage?: string;
}

export default function AgentActivityMonitor({ agentId }: AgentActivityMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch recent heartbeats
  const { data: heartbeats, refetch: refetchHeartbeats } = useQuery<Heartbeat[]>({
    queryKey: ['agent-heartbeats', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/heartbeats?limit=10`);
      if (!response.ok) throw new Error('Failed to fetch heartbeats');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch recent actions
  const { data: actions, refetch: refetchActions } = useQuery<Action[]>({
    queryKey: ['agent-actions', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/actions?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch actions');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'RUNNING':
      case 'EXECUTING':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'RUNNING':
      case 'EXECUTING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const latestHeartbeat = heartbeats?.[0];
  const isCurrentlyActive = latestHeartbeat?.status === 'EXECUTING' || latestHeartbeat?.status === 'RUNNING';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Agent Activity Monitor
            {isCurrentlyActive && (
              <Badge className="bg-blue-100 text-blue-800 animate-pulse">
                Active
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Latest Heartbeat Status */}
        {latestHeartbeat && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(latestHeartbeat.status)}
              <div>
                <div className="font-medium">Latest Heartbeat</div>
                <div className="text-sm text-gray-600">
                  {formatTime(latestHeartbeat.scheduledAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(latestHeartbeat.status)}>
                {latestHeartbeat.status}
              </Badge>
              <div className="text-sm text-gray-600 mt-1">
                {latestHeartbeat.eventsProcessed} events → {latestHeartbeat.actionsTriggered} actions
              </div>
            </div>
          </div>
        )}

        {/* Recent Actions */}
        {(isExpanded ? actions : actions?.slice(0, 5))?.map((action) => (
          <div key={action.id} className="flex items-center justify-between p-2 border rounded">
            <div className="flex items-center gap-3">
              {getStatusIcon(action.status)}
              <div>
                <div className="font-medium text-sm">{action.toolName}</div>
                {action.startedAt && (
                  <div className="text-xs text-gray-600">
                    Started: {formatTime(action.startedAt)}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <Badge className={getStatusColor(action.status)} variant="outline">
                {action.status}
              </Badge>
              {action.executionTimeMs && (
                <div className="text-xs text-gray-600 mt-1">
                  {formatDuration(action.executionTimeMs)}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Error Display */}
        {latestHeartbeat?.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="font-medium">Error in latest heartbeat</span>
            </div>
            <div className="text-sm text-red-700 mt-1">
              {latestHeartbeat.errorMessage}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchHeartbeats();
              refetchActions();
            }}
          >
            Refresh Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
