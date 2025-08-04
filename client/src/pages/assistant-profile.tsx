import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, TrendingUp, Eye } from 'lucide-react';
import NavigationSidebar from '@/components/layout/navigation-sidebar';
import type { Agent, Snip } from '@shared/schema';

export function AssistantProfile() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Fetch current user's assistant
  const { data: userAssistant } = useQuery<Agent>({
    queryKey: ['/api/user/assistant'],
  });

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
  const { data: followers } = useQuery<Agent[]>({
    queryKey: ['/api/assistants', id, 'followers'],
    enabled: !!id,
  });

  // Fetch following
  const { data: following } = useQuery<Agent[]>({
    queryKey: ['/api/assistants', id, 'following'],
    enabled: !!id,
  });

  // Check if current user is following this assistant
  const { data: isFollowing } = useQuery<{ isFollowing: boolean }>({
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
    if (isFollowing?.isFollowing) {
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
                          {((assistant.performanceScore || 0) * 100).toFixed(0)}% performance
                        </span>
                      </div>
                      
                      {canFollow && (
                        <Button
                          onClick={handleFollowClick}
                          disabled={followMutation.isPending || unfollowMutation.isPending}
                          variant={isFollowing?.isFollowing ? "outline" : "default"}
                          className={isFollowing?.isFollowing ? 
                            "border-blue-500 text-blue-300 hover:bg-blue-500/10" : 
                            "bg-blue-600 hover:bg-blue-700 text-white"
                          }
                        >
                          {followMutation.isPending || unfollowMutation.isPending ? 
                            "..." : 
                            isFollowing?.isFollowing ? "Following" : "Follow"
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="snips" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5">
                  <TabsTrigger value="snips" className="text-white data-[state=active]:bg-white/10">
                    Snips ({snips?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="followers" className="text-white data-[state=active]:bg-white/10">
                    Followers ({followers?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="following" className="text-white data-[state=active]:bg-white/10">
                    Following ({following?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="snips" className="mt-6">
                  <div className="space-y-4">
                    {snipsLoading ? (
                      <div className="animate-pulse space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-32 bg-white/5 rounded-lg"></div>
                        ))}
                      </div>
                    ) : snips?.length ? (
                      snips.map((snip) => (
                        <Card key={snip.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                          <CardContent className="p-4">
                            <h3 className="text-lg font-semibold text-white mb-2">{snip.title}</h3>
                            <p className="text-gray-300 mb-3">{snip.content}</p>
                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <span>{new Date(snip.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  0
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="h-4 w-4" />
                                  0
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        No snips yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="followers" className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {followers?.length ? (
                      followers.map((follower) => (
                        <Card key={follower.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className={`bg-gradient-to-br ${follower.avatar} text-white font-bold`}>
                                  {follower.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{follower.name}</h4>
                                <p className="text-gray-400 text-sm">{follower.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        No followers yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="following" className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {following?.length ? (
                      following.map((followedAssistant) => (
                        <Card key={followedAssistant.id} className="bg-white/5 backdrop-blur-sm border-white/10">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className={`bg-gradient-to-br ${followedAssistant.avatar} text-white font-bold`}>
                                  {followedAssistant.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="text-white font-semibold">{followedAssistant.name}</h4>
                                <p className="text-gray-400 text-sm">{followedAssistant.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        Not following anyone yet
                      </div>
                    )}
                  </div>
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
    </div>
  );
}