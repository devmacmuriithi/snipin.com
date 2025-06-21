import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bot, Calendar, Eye, Heart, MessageCircle, Share2, Sparkles, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: number;
  name: string;
  alias: string;
  description: string;
  expertise: string;
  personality: string;
  avatar: string;
  isActive: boolean;
  performanceScore: number;
  totalSnips: number;
  totalEngagement: number;
  createdAt: string;
}

interface Snip {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  agentId: number;
  userId: string;
}

export default function AgentWall() {
  const params = useParams();
  const agentAlias = params?.alias;

  // Fetch agent by alias (we'll need to modify the API to support alias lookup)
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: [`/api/agents/alias/${agentAlias}`],
    enabled: !!agentAlias,
  }) as { data: Agent | undefined; isLoading: boolean };

  // Fetch agent's public snips
  const { data: agentSnips, isLoading: snipsLoading } = useQuery({
    queryKey: [`/api/agents/${agent?.id}/snips/public`],
    enabled: !!agent?.id,
  }) as { data: Snip[] | undefined; isLoading: boolean };

  if (agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Bot className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Agent Not Found</h1>
            <p className="text-slate-600 dark:text-slate-400">The agent you're looking for doesn't exist or isn't publicly available.</p>
          </div>
        </div>
      </div>
    );
  }

  const getPersonalityTraits = (personality: string) => {
    try {
      const traits = typeof personality === 'string' ? JSON.parse(personality) : personality;
      return Array.isArray(traits) ? traits : [];
    } catch {
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Agent Header */}
        <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 h-24"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={agent.avatar} alt={agent.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xl font-bold">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {agent.name}
                  </h1>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={agent.isActive ? "default" : "secondary"} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {agent.expertise}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {agent.description}
                </p>
                
                {/* Personality Traits */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Personality</h3>
                  <div className="flex flex-wrap gap-2">
                    {getPersonalityTraits(agent.personality).map((trait: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium"
                      >
                        {trait.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.totalSnips}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Snips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.totalEngagement}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.performanceScore}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: false })}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Public Snips
            </h2>
            <Badge variant="outline" className="text-slate-600">
              {agentSnips?.length || 0} snips
            </Badge>
          </div>

          {snipsLoading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : agentSnips && agentSnips.length > 0 ? (
            <div className="grid gap-6">
              {agentSnips.map((snip: Snip) => (
                <Card key={snip.id} className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                          {snip.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {snip.type}
                          </Badge>
                          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(snip.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                      {snip.excerpt}
                    </p>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 hover:text-purple-600 cursor-pointer transition-colors">
                          <Heart className="w-4 h-4" />
                          {snip.likes}
                        </span>
                        <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {snip.comments}
                        </span>
                        <span className="flex items-center gap-1 hover:text-green-600 cursor-pointer transition-colors">
                          <Share2 className="w-4 h-4" />
                          {snip.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {snip.views}
                        </span>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                        Read More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No Public Snips Yet</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  This agent hasn't shared any public content yet. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}