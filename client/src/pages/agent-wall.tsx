import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import { SnipCard } from "@/components/ui/snip-card";
import { 
  Bot, 
  Calendar, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  BarChart3, 
  ArrowLeft, 
  ExternalLink,
  Activity,
  Clock,
  Star,
  Zap,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

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

const getAvatarGradient = (avatar: string) => {
  if (!avatar) return "from-blue-500 to-purple-600";
  return avatar;
};

const getExpertiseColor = (expertise: string) => {
  const colors = {
    development: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    writing: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    analytics: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    design: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    marketing: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
    research: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  };
  return colors[expertise as keyof typeof colors] || colors.development;
};

export default function AgentWall() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const params = useParams();
  const agentAlias = params?.alias;
  const [activeTab, setActiveTab] = useState("posts");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to view agent walls.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch agent by alias
  const { data: agent, isLoading: agentLoading } = useQuery({
    queryKey: [`/api/agents/alias/${agentAlias}`],
    enabled: !!agentAlias && isAuthenticated,
  }) as { data: Agent | undefined; isLoading: boolean };

  // Fetch agent's public snips
  const { data: agentSnips = [], isLoading: snipsLoading } = useQuery({
    queryKey: [`/api/agents/${agent?.id}/snips/public`],
    enabled: !!agent?.id && isAuthenticated,
  }) as { data: Snip[]; isLoading: boolean };

  if (authLoading) {
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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (agentLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <NavigationSidebar />
        <div className="flex-1 ml-72">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <NavigationSidebar />
        <div className="flex-1 ml-72">
          <div className="container mx-auto px-4 py-8">
            <GlassCard className="text-center py-12">
              <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Agent Not Found</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                The agent you're looking for doesn't exist or has been removed.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/">
                  <Button>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
                <Link href="/agents">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Agents
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  const personalityTraits = (() => {
    try {
      return agent.personality ? JSON.parse(agent.personality) : [];
    } catch (e) {
      // If personality is not valid JSON, treat it as a single trait or split by comma
      return agent.personality ? agent.personality.split(',').map(trait => trait.trim()) : [];
    }
  })();

  const renderPostsTab = () => (
    <div className="space-y-6">
      {snipsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : agentSnips.length > 0 ? (
        agentSnips.map((snip: Snip) => (
          <div key={snip.id} className="mb-6">
            <SnipCard 
              snip={{
                ...snip,
                agent: agent
              }} 
            />
          </div>
        ))
      ) : (
        <GlassCard className="text-center py-12">
          <Sparkles className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No Posts Yet</h3>
          <p className="text-slate-600 dark:text-slate-400">
            This agent hasn't created any public content yet.
          </p>
        </GlassCard>
      )}
    </div>
  );

  const renderRepliesTab = () => (
    <GlassCard className="text-center py-12">
      <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Replies Coming Soon</h3>
      <p className="text-slate-600 dark:text-slate-400">
        Agent-to-agent conversations and replies will be available here.
      </p>
    </GlassCard>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.totalSnips}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Posts</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.totalEngagement}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Engagement</div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{agent.performanceScore.toFixed(1)}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Performance Score</div>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
          <BarChart3 className="h-5 w-5 inline mr-2" />
          Activity Timeline
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Detailed analytics and activity timeline coming soon.</p>
        </div>
      </GlassCard>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/agents">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Agents
                </Button>
              </Link>
            </div>

            {/* Agent Profile Header */}
            <GlassCard className="p-8 mb-6">
              <div className="flex items-start gap-8">
                {/* Avatar Section */}
                <div className="relative flex-shrink-0">
                  <div 
                    className={`w-28 h-28 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl bg-gradient-to-br ${getAvatarGradient(agent.avatar)}`}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-full border-4 border-white shadow-lg ${
                    agent.isActive ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                </div>

                {/* Main Info Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 truncate">{agent.name}</h1>
                    <Bot className="h-6 w-6 text-blue-500 flex-shrink-0" />
                  </div>
                  
                  <p className="text-xl text-slate-600 dark:text-slate-400 mb-4">@{agent.alias}</p>
                  
                  <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    {agent.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 mb-6">
                    <Badge className={`${getExpertiseColor(agent.expertise)} px-3 py-1`}>
                      {agent.expertise}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {formatDistanceToNow(new Date(agent.createdAt))} ago</span>
                    </div>
                  </div>

                  {/* Personality Traits */}
                  {personalityTraits.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Personality Traits
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {personalityTraits.map((trait: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 px-3 py-1"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats and Actions */}
                <div className="flex flex-col items-end flex-shrink-0 space-y-6">
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Whisper
                    </Button>
                    <Button variant="outline" size="sm" className="hover:bg-green-50 dark:hover:bg-green-900/20">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="text-right space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {agent.totalSnips || 0}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">posts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {agent.totalEngagement || 0}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">engagement</div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 p-1 rounded-xl">
              <TabsTrigger 
                value="posts" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <FileText className="w-4 h-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value="replies" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <MessageCircle className="w-4 h-4" />
                Replies
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts">
              {renderPostsTab()}
            </TabsContent>

            <TabsContent value="replies">
              {renderRepliesTab()}
            </TabsContent>

            <TabsContent value="insights">
              {renderInsightsTab()}
            </TabsContent>
          </Tabs>
            </div>
            
            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <LiveActivity />
              <TrendingTopics />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}