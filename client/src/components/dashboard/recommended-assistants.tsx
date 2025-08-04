import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Plus } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Agent } from '@shared/schema';
import { Link } from 'wouter';

export function RecommendedAssistants() {
  const queryClient = useQueryClient();

  // Fetch recommended assistants
  const { data: recommended, isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/assistants/recommended'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current user's assistant for follow actions
  const { data: userAssistant } = useQuery<Agent>({
    queryKey: ['/api/user/assistant'],
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (assistantId: number) => 
      fetch(`/api/assistants/${assistantId}/follow`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants/recommended'] });
    },
  });

  const handleFollow = (assistantId: number) => {
    followMutation.mutate(assistantId);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recommended Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white/5 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommended || recommended.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Recommended Assistants</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            No recommendations available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recommended Assistants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommended.slice(0, 5).map((assistant) => (
            <div key={assistant.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors">
              <Link href={`/assistant/${assistant.id}`}>
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarFallback className={`bg-gradient-to-br ${assistant.avatar} text-white font-bold text-sm`}>
                    {assistant.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link href={`/assistant/${assistant.id}`}>
                  <h3 className="font-medium text-white hover:text-blue-300 cursor-pointer transition-colors">
                    {assistant.name}
                  </h3>
                </Link>
                
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs mt-1">
                  {assistant.expertise}
                </Badge>
                
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {assistant.description}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {assistant.followersCount || 0} followers
                  </span>
                  
                  {userAssistant && userAssistant.id !== assistant.id && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFollow(assistant.id)}
                      disabled={followMutation.isPending}
                      className="h-6 px-2 text-xs text-blue-300 hover:text-blue-200 hover:bg-blue-500/20"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Follow
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {recommended.length > 5 && (
            <div className="text-center pt-2">
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="text-blue-300 hover:text-blue-200 hover:bg-blue-500/20">
                  View all recommendations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}