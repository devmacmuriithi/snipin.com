import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import WhisperAnalyticsWidget from "@/components/dashboard/whisper-analytics-widget";
import RecentActivityWidget from "@/components/dashboard/recent-activity-widget";
import WhisperTipsWidget from "@/components/dashboard/whisper-tips-widget";
import WhisperImpactWidget from "@/components/dashboard/whisper-impact-widget";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Brain, Clock, CheckCircle, XCircle, Search, Filter, Zap, Bot, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Whisper {
  id: number;
  content: string;
  type: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  createdAt: string;
  agentId?: number;
}

interface Agent {
  id: number;
  name: string;
  expertise: string;
  avatar: string;
}

export default function Whispers() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whisperContent, setWhisperContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [whisperType, setWhisperType] = useState<string>("thought");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: whispers = [], refetch: refetchWhispers } = useQuery({
    queryKey: ["/api/whispers"],
    enabled: !!user,
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  // Auto-select the first agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      setSelectedAgent(agents[0].id.toString());
    }
  }, [agents, selectedAgent]);

  const createWhisperMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/whispers", data);
    },
    onSuccess: () => {
      toast({
        title: "Whisper Sent",
        description: "Your whisper has been sent to your agent for processing.",
      });
      setWhisperContent("");
      refetchWhispers();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
        description: "Failed to send whisper. Please try again.",
        variant: "destructive",
      });
    },
  });

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

  const handleSubmitWhisper = () => {
    if (!whisperContent.trim() || !selectedAgent) {
      toast({
        title: "Missing Information",
        description: "Please enter your whisper and select an agent.",
        variant: "destructive",
      });
      return;
    }

    createWhisperMutation.mutate({
      content: whisperContent,
      type: whisperType,
      agentId: parseInt(selectedAgent),
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-orange-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      thought: 'bg-purple-100 text-purple-800 border-purple-200',
      question: 'bg-blue-100 text-blue-800 border-blue-200',
      idea: 'bg-green-100 text-green-800 border-green-200',
      code: 'bg-red-100 text-red-800 border-red-200',
      discovery: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAgentById = (agentId: number) => {
    return agents.find((agent: any) => agent.id === agentId);
  };

  const filteredWhispers = whispers.filter((whisper: any) => {
    const matchesSearch = whisper.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || whisper.status === statusFilter;
    const matchesType = typeFilter === 'all' || whisper.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const whisperStats = {
    total: whispers.length,
    processed: whispers.filter((w: any) => w.status === 'processed').length,
    processing: whispers.filter((w: any) => w.status === 'processing').length,
    pending: whispers.filter((w: any) => w.status === 'pending').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            
            {/* Main Content */}
            <div className="col-span-6">
              <div className="animate-pulse space-y-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Sidebar - Empty for loading */}
            <div className="col-span-3">
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-6 space-y-6">
          {/* Header */}
          <GlassCard className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Whispers</h1>
                <p className="text-slate-600 text-lg">Share your private thoughts with AI agents</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{whisperStats.total}</div>
                  <div className="text-sm text-slate-500 font-semibold">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{whisperStats.processed}</div>
                  <div className="text-sm text-slate-500 font-semibold">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{whisperStats.processing}</div>
                  <div className="text-sm text-slate-500 font-semibold">Processing</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Search and Filters */}
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search whispers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="thought">Thought</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="code">Code</SelectItem>
                  <SelectItem value="discovery">Discovery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Whisper Composer */}
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Share a New Whisper
            </h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Share a random thought, observation, or mental note with your AI agent..."
                value={whisperContent}
                onChange={(e) => setWhisperContent(e.target.value)}
                className="min-h-32 resize-none border-2 focus:border-blue-500 bg-slate-50"
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={whisperType} onValueChange={setWhisperType}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Whisper type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="thought">💭 Thought</SelectItem>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="idea">💡 Idea</SelectItem>
                    <SelectItem value="code">💻 Code</SelectItem>
                    <SelectItem value="discovery">🔍 Discovery</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent: any) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4" />
                          {agent.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleSubmitWhisper}
                  disabled={createWhisperMutation.isPending || !whisperContent.trim() || !selectedAgent}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto"
                >
                  {createWhisperMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Send Whisper
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Whispers Feed */}
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Your Whispers ({filteredWhispers.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredWhispers.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">
                    {whispers.length === 0 ? "No whispers yet" : "No whispers match your filters"}
                  </h3>
                  <p className="text-slate-500">
                    {whispers.length === 0 
                      ? "Share your first whisper to get started with AI content generation."
                      : "Try adjusting your search or filter criteria."
                    }
                  </p>
                </div>
              ) : (
                filteredWhispers.map((whisper: any) => {
                  const agent = getAgentById(whisper.agentId);
                  return (
                    <div key={whisper.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          {agent && (
                            <div className={`w-10 h-10 bg-gradient-to-br ${agent.avatar} rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                              {agent.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-800">
                              {agent ? `To ${agent.name}` : 'To Agent'}
                            </div>
                            <div className="text-sm text-slate-500">
                              {new Date(whisper.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getTypeColor(whisper.type)} text-xs font-semibold uppercase tracking-wide`}>
                            {whisper.type}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(whisper.status)}
                            <span className="text-sm text-slate-500 capitalize font-medium">
                              {whisper.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-4 border-l-4 border-purple-400">
                        <p className="text-slate-700 italic leading-relaxed">
                          "{whisper.content}"
                        </p>
                      </div>

                      {whisper.status === 'processed' && agent && (
                        <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="flex items-center text-green-800 text-sm font-semibold mb-2">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Processed by {agent.name}
                          </div>
                          <p className="text-green-700 text-sm">
                            This whisper has been successfully processed and converted into content.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <WhisperAnalyticsWidget />
            <WhisperImpactWidget />
            <RecentActivityWidget />
            <WhisperTipsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}