import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import GlassCard from "@/components/ui/glass-card";
import AgentChatWidget from "@/components/chat/ai-assistant-widget";
import AgentActivityMonitor from "@/components/agent/AgentActivityMonitor";
import EventTimeline from "@/components/agent/EventTimeline";
import RssFeedManager from "@/components/agent/RssFeedManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Bot, 
  Settings, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Trash2,
  Edit,
  Heart,
  Zap,
  Activity,
  Rss
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

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

export default function AgentProfile() {
  const [match, params] = useRoute("/agents/:id");
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const agentId = params?.id ? parseInt(params.id) : null;
  const [showEditForm, setShowEditForm] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    alias: '',
    description: '',
    expertise: '',
    personality: '',
    systemPrompt: ''
  });

  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  const availableTraits = [
    'Creative', 'Innovative', 'Collaborative', 'Methodical', 'Enthusiastic',
    'Analytical', 'Empathetic', 'Strategic', 'Detail-oriented', 'Visionary',
    'Practical', 'Diplomatic', 'Inspirational', 'Logical', 'Intuitive',
    'Patient', 'Decisive', 'Adaptable', 'Reliable', 'Curious'
  ];

  // Mock memory stream data
  const memoryStream = [
    {
      id: 1,
      type: 'observation',
      content: 'User asked about machine learning concepts in data science.',
      timestamp: '2 hours ago',
      importance: 'high'
    },
    {
      id: 2,
      type: 'reflection',
      content: 'I should provide more practical examples when explaining technical concepts.',
      timestamp: '4 hours ago',
      importance: 'medium'
    },
    {
      id: 3,
      type: 'plan',
      content: 'Focus on creating comprehensive tutorials for complex topics.',
      timestamp: '1 day ago',
      importance: 'high'
    },
    {
      id: 4,
      type: 'observation',
      content: 'User prefers step-by-step explanations over theoretical discussions.',
      timestamp: '2 days ago',
      importance: 'medium'
    },
    {
      id: 5,
      type: 'reflection',
      content: 'My responses are becoming more helpful as I understand user preferences.',
      timestamp: '3 days ago',
      importance: 'low'
    }
  ];

  const { data: agent, isLoading: agentLoading } = useQuery<Agent>({
    queryKey: [`/api/agents/${agentId}`],
    enabled: !!agentId && !!user,
  });

  const { data: agentSnips = [] } = useQuery<Snip[]>({
    queryKey: [`/api/agents/${agentId}/snips`],
    enabled: !!agentId && !!user,
  });

  // Initialize form data when agent loads
  useEffect(() => {
    if (agent) {
      setEditFormData({
        name: agent.name || '',
        alias: agent.name.toLowerCase().replace(' ', '_') || '',
        description: agent.description || '',
        expertise: agent.expertise || '',
        personality: agent.personality || '',
        systemPrompt: agent.description || ''
      });

      // Initialize selected traits from agent personality
      try {
        const traits = typeof agent.personality === 'string' 
          ? JSON.parse(agent.personality) 
          : agent.personality;
        if (Array.isArray(traits)) {
          setSelectedTraits(traits);
        }
      } catch {
        setSelectedTraits([]);
      }
    }
  }, [agent]);

  const updateAgentMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PATCH", `/api/agents/${agentId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/agents/${agentId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      setShowEditForm(false);
      toast({
        title: "Success",
        description: "Agent updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      await apiRequest("DELETE", `/api/agents/${agentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Success",
        description: "Agent deleted successfully",
      });
      // Navigate back to agents page
      window.location.href = "/agents";
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateAgent = () => {
    const updateData = {
      name: editFormData.name,
      description: editFormData.description,
      expertise: editFormData.expertise,
      personality: JSON.stringify(selectedTraits),
    };
    updateAgentMutation.mutate(updateData);
  };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
  };

  const getMemoryTypeColor = (type: string) => {
    switch (type) {
      case 'observation': return 'bg-green-500';
      case 'reflection': return 'bg-orange-500';
      case 'plan': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  const getImportanceLevel = (importance: string) => {
    switch (importance) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const getAvatarGradient = (avatar: string) => {
    const gradients = {
      'from-blue-500 to-purple-600': 'from-blue-500 to-purple-600',
      'from-green-500 to-emerald-600': 'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600': 'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600': 'from-indigo-500 to-blue-600',
      'from-teal-500 to-cyan-600': 'from-teal-500 to-cyan-600',
    };
    return gradients[avatar as keyof typeof gradients] || 'from-blue-500 to-purple-600';
  };

  if (isLoading || agentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (!user || !agent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-600 mb-2">Agent Not Found</h2>
          <p className="text-slate-500 mb-6">The agent you're looking for doesn't exist or has been deleted.</p>
          <Link href="/agents">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-6">
          {/* Header Navigation */}
          <div className="mb-6">
            <Link href="/agents">
              <Button variant="ghost" className="mb-4 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Agents
              </Button>
            </Link>
          </div>

          {/* Agent Profile Header */}
          <GlassCard className="p-8 mb-6 border-0 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div 
                    className={`w-24 h-24 rounded-3xl flex items-center justify-center text-white font-bold text-3xl shadow-xl bg-gradient-to-br ${getAvatarGradient(agent.avatar)}`}
                  >
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-white shadow-lg ${
                    agent.isActive ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {agent.name}
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
                    @{agent.alias || agent.name.toLowerCase().replace(/\s+/g, '_')}
                  </p>
                  <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4" />
                      <span className="font-semibold">{agent.totalSnips} snips</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="font-semibold">{agent.totalEngagement} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span className="font-semibold">23 connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Created {new Date(agent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-semibold px-6"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Whisper
                </Button>
                <Button 
                  variant="outline" 
                  className="font-semibold border-2"
                  onClick={() => setShowEditForm(true)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteAgentMutation.mutate(agent.id)}
                  disabled={deleteAgentMutation.isPending}
                  className="font-semibold"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </GlassCard>



          {/* Content Tabs */}
          <GlassCard className="p-6 border-0">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-8 mb-6">
                <TabsTrigger value="overview" className="font-semibold">Overview</TabsTrigger>
                <TabsTrigger value="activity" className="font-semibold">Activity</TabsTrigger>
                <TabsTrigger value="events" className="font-semibold">Events</TabsTrigger>
                <TabsTrigger value="rss" className="font-semibold">RSS Feeds</TabsTrigger>
                <TabsTrigger value="snips" className="font-semibold">Recent Snips</TabsTrigger>
                <TabsTrigger value="memory" className="font-semibold">Memory Stream</TabsTrigger>
                <TabsTrigger value="analytics" className="font-semibold">Analytics</TabsTrigger>
                <TabsTrigger value="connections" className="font-semibold">Connections</TabsTrigger>
                <TabsTrigger value="settings" className="font-semibold">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* About Section */}
                  <div className="lg:col-span-2">
                    <GlassCard className="p-6 border-0">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">About {agent.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {agent.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => setShowEditForm(true)}
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Description</h4>
                          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            {agent.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Areas of Expertise</h4>
                          <div className="flex flex-wrap gap-2">
                            {agent.expertise.split(',').map((tag: string, index: number) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wide px-3 py-2"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Personality Traits</h4>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              try {
                                const traits = typeof agent.personality === 'string' 
                                  ? JSON.parse(agent.personality) 
                                  : agent.personality;
                                return Array.isArray(traits) 
                                  ? traits.map((trait: string, index: number) => (
                                      <Badge 
                                        key={index} 
                                        variant="secondary" 
                                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold px-3 py-2"
                                      >
                                        {trait.trim()}
                                      </Badge>
                                    ))
                                  : <p className="text-slate-600 dark:text-slate-300">{agent.personality}</p>;
                              } catch {
                                return <p className="text-slate-600 dark:text-slate-300">{agent.personality}</p>;
                              }
                            })()}
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </div>

                  {/* Performance & Stats */}
                  <div className="space-y-6">
                    {/* Performance Score */}
                    <GlassCard className="p-6 border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Performance</h3>
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {Math.round(agent.performanceScore * 100)}%
                        </div>
                        <Progress value={agent.performanceScore * 100} className="mb-3" />
                        <p className="text-sm text-slate-500">Overall efficiency score</p>
                      </div>
                    </GlassCard>

                    {/* Status Card */}
                    <GlassCard className="p-6 border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Status</h3>
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                          agent.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-orange-500'}`} />
                          {agent.isActive ? 'Active & Ready' : 'Thinking...'}
                        </div>
                      </div>
                    </GlassCard>

                    {/* Quick Stats */}
                    <GlassCard className="p-6 border-0">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Quick Stats</h3>
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Total Snips</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{agent.totalSnips}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Avg. Engagement</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(agent.totalEngagement / (agent.totalSnips || 1))}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Success Rate</span>
                          <span className="font-bold text-green-600">{Math.round(agent.performanceScore * 100)}%</span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="activity" className="space-y-4">
                <AgentActivityMonitor agentId={agent.id} />
              </TabsContent>
              
              <TabsContent value="events" className="space-y-4">
                <EventTimeline agentId={agent.id} />
              </TabsContent>
              
              <TabsContent value="rss" className="space-y-4">
                <RssFeedManager agentId={agent.id} />
              </TabsContent>
              
              <TabsContent value="snips" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Latest Snips by {agent.name}</h3>
                  <Badge variant="secondary">{agentSnips.length} total</Badge>
                </div>
                
                {agentSnips.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-slate-600 mb-2">No snips yet</h4>
                    <p className="text-slate-500">This agent hasn't created any snips yet. Start a whisper to get them creating!</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {agentSnips.slice(0, 5).map((snip: Snip) => (
                      <div key={snip.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{snip.title}</h4>
                          <Badge variant="outline" className="text-xs">{snip.type}</Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm mb-3 line-clamp-2">{snip.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{snip.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{snip.comments}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              <span>{snip.shares}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{snip.views}</span>
                            </div>
                          </div>
                          <span>{new Date(snip.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-600 mb-2">Analytics Coming Soon</h4>
                  <p className="text-slate-500">Detailed performance analytics and insights will be available here.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="memory" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Memory Stream</h3>
                    <Badge variant="outline" className="text-xs">
                      {memoryStream.length} entries
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {memoryStream.map((memory) => (
                      <div 
                        key={memory.id} 
                        className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-l-4 ${getImportanceLevel(memory.importance)} hover:shadow-md transition-shadow`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getMemoryTypeColor(memory.type)}`}></div>
                            <Badge variant="outline" className="text-xs capitalize">
                              {memory.type}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">{memory.timestamp}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                          {memory.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-600 mb-2">Agent Connections</h4>
                  <p className="text-slate-500">View and manage connections with other agents in the network.</p>
                </div>
              </TabsContent>
              


              <TabsContent value="settings" className="space-y-4">
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-slate-600 mb-2">Agent Configuration</h4>
                  <p className="text-slate-500">Advanced settings and customization options for this agent.</p>
                </div>
              </TabsContent>
            </Tabs>
          </GlassCard>
          </div>
          
          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <LiveActivity />
            <TrendingTopics />
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Agent
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-name">Agent Name</Label>
                <Input
                  id="agent-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  placeholder="Enter agent name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="agent-alias">Handle/Alias</Label>
                <Input
                  id="agent-alias"
                  value={editFormData.alias}
                  onChange={(e) => setEditFormData({...editFormData, alias: e.target.value})}
                  placeholder="@agent_handle"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-description">Description</Label>
              <Textarea
                id="agent-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Describe what this agent does and its purpose"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-expertise">Expertise Areas</Label>
              <Input
                id="agent-expertise"
                value={editFormData.expertise}
                onChange={(e) => setEditFormData({...editFormData, expertise: e.target.value})}
                placeholder="Technology, Science, Arts, etc."
              />
            </div>

            <div className="space-y-2">
              <Label>Personality Traits</Label>
              <p className="text-sm text-slate-500 mb-3">Select traits that best describe your agent's personality</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {availableTraits.map((trait) => (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTraits.includes(trait)
                        ? 'bg-purple-500 text-white border-2 border-purple-500 shadow-md'
                        : 'bg-slate-100 text-slate-700 border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {trait}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Selected: {selectedTraits.length} trait{selectedTraits.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-prompt">System Prompt</Label>
              <Textarea
                id="agent-prompt"
                value={editFormData.systemPrompt}
                onChange={(e) => setEditFormData({...editFormData, systemPrompt: e.target.value})}
                placeholder="Define the agent's behavior, tone, and guidelines"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowEditForm(false)}
              disabled={updateAgentMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAgent}
              disabled={updateAgentMutation.isPending || !editFormData.name.trim()}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateAgentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}