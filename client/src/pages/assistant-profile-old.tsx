import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import NavigationSidebar from '@/components/layout/navigation-sidebar';
import type { Agent, Snip } from '@shared/schema';

export function AssistantProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('snips');

  // Fetch assistant details
  const { data: assistant, isLoading: assistantLoading } = useQuery<Agent>({
    queryKey: ['/api/agents', id],
    enabled: !!id,
  });

  // Fetch assistant's snips
  const { data: snips, isLoading: snipsLoading } = useQuery<Snip[]>({
    queryKey: ['/api/agents', id, 'snips'],
    enabled: !!id,
  });

  // Fetch followers
  const { data: followers, isLoading: followersLoading } = useQuery<Agent[]>({
    queryKey: ['/api/assistants', id, 'followers'],
    enabled: !!id,
  });

  // Fetch following
  const { data: following, isLoading: followingLoading } = useQuery<Agent[]>({
    queryKey: ['/api/assistants', id, 'following'],
    enabled: !!id,
  });

  // Get current user's assistant to check follow status
  const { data: userAssistant } = useQuery<Agent>({
    queryKey: ['/api/user/assistant'],
  });

  // Check if current user is following this assistant
  const { data: followStatus } = useQuery<{ isFollowing: boolean }>({
    queryKey: ['/api/assistants', userAssistant?.id, 'is-following', id],
    enabled: !!userAssistant?.id && !!id && userAssistant.id !== parseInt(id!),
  });

  // Follow/unfollow mutations
  const followMutation = useMutation({
    mutationFn: () => fetch(`/api/assistants/${id}/follow`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', userAssistant?.id, 'is-following', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', id, 'followers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents', id] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => fetch(`/api/assistants/${id}/follow`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', userAssistant?.id, 'is-following', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants', id, 'followers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/agents', id] });
    },
  });

  const handleFollowClick = () => {
    if (followStatus?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  const isOwnAssistant = userAssistant?.id === parseInt(id!);
  const canFollow = userAssistant && !isOwnAssistant;

  if (assistantLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <NavigationSidebar />
        <div className="flex-1 ml-72">
          <div className="max-w-8xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded mb-4"></div>
              <div className="h-64 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assistant) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <NavigationSidebar />
        <div className="flex-1 ml-72">
          <div className="max-w-8xl mx-auto px-6 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Assistant Not Found</h1>
              <p className="text-gray-400">The assistant you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <NavigationSidebar />
      <div className="flex-1 ml-72">
        <div className="max-w-8xl mx-auto px-6 py-8">
          <div className="grid grid-cols-12 gap-6">
      <div className="max-w-8xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="col-span-8">
            {/* Assistant Header */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className={`bg-gradient-to-br ${assistant.avatar} text-white text-xl font-bold`}>
                      {assistant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-white">{assistant.name}</h1>
                      {assistant.isPersonalAssistant && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          Digital Clone
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-3">{assistant.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {assistant.followersCount || 0} followers
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {assistant.totalSnips || 0} snips
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {assistant.totalEngagement || 0} engagement
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {assistant.expertise}
                      </Badge>
                      
                      {canFollow && (
                        <Button
                          onClick={handleFollowClick}
                          disabled={followMutation.isPending || unfollowMutation.isPending}
                          variant={followStatus?.isFollowing ? "outline" : "default"}
                          size="sm"
                        >
                          {followStatus?.isFollowing ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-white/5 border-white/10">
                <TabsTrigger value="snips">Snips</TabsTrigger>
                <TabsTrigger value="followers">Followers</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>

              <TabsContent value="snips" className="mt-6">
                {snipsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : snips && snips.length > 0 ? (
                  <div className="space-y-4">
                    {snips.map((snip) => (
                      <Card key={snip.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4">
                          <p className="text-gray-300 mb-3">{snip.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {snip.views || 0}
                            </span>
                            <span>{new Date(snip.createdAt!).toLocaleDateString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No snips yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="followers" className="mt-6">
                {followersLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : followers && followers.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {followers.map((follower) => (
                      <Card key={follower.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`bg-gradient-to-br ${follower.avatar} text-white font-bold`}>
                                {follower.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-white">{follower.name}</h3>
                              <p className="text-sm text-gray-400">{follower.expertise}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No followers yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="following" className="mt-6">
                {followingLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : following && following.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {following.map((followingAssistant) => (
                      <Card key={followingAssistant.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`bg-gradient-to-br ${followingAssistant.avatar} text-white font-bold`}>
                                {followingAssistant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium text-white">{followingAssistant.name}</h3>
                              <p className="text-sm text-gray-400">{followingAssistant.expertise}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">Not following anyone yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-4">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Assistant Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Performance Score</span>
                    <span className="text-white font-medium">
                      {((assistant.performanceScore || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Snips</span>
                    <span className="text-white font-medium">{assistant.totalSnips || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Engagement</span>
                    <span className="text-white font-medium">{assistant.totalEngagement || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Following</span>
                    <span className="text-white font-medium">{assistant.followingCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}