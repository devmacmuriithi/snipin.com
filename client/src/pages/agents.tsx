import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import AgentCreationWizard from "@/components/agents/agent-creation-wizard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Bot, 
  Plus, 
  Settings, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Trash2,
  Edit,
  Heart,
  Users,
  Scissors,
  Activity,
  Sparkles,
  Eye,
  Zap,
  ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Agent {
  id: number;
  name: string;
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

export default function Agents() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  const deleteAgentMutation = useMutation({
    mutationFn: async (agentId: number) => {
      await apiRequest("DELETE", `/api/agents/${agentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Agent Deleted",
        description: "Your agent has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
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
        description: "Failed to delete agent. Please try again.",
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

  const getExpertiseColor = (expertise: string) => {
    const colors = {
      development: 'bg-blue-100 text-blue-800',
      writing: 'bg-green-100 text-green-800',
      analytics: 'bg-purple-100 text-purple-800',
      design: 'bg-pink-100 text-pink-800',
      marketing: 'bg-orange-100 text-orange-800',
      research: 'bg-indigo-100 text-indigo-800',
    };
    return colors[expertise as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading agents...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <GlassCard className="p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">My Agents</h1>
                <p className="text-slate-600 text-lg">Manage your AI agents and their specializations</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{agents.length}</div>
                  <div className="text-sm text-slate-500 font-semibold">Active Agents</div>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Agent
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <AgentCreationWizard onClose={() => setShowCreateDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </GlassCard>

          {/* Agents Grid */}
          {agents.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Bot className="h-16 w-16 text-slate-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-600 mb-4">No agents created yet</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Create your first AI agent to start transforming your whispers into amazing content. 
                Each agent can specialize in different areas like coding, writing, or analytics.
              </p>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Agent
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <AgentCreationWizard onClose={() => setShowCreateDialog(false)} />
                </DialogContent>
              </Dialog>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent: Agent) => (
                <GlassCard key={agent.id} className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden">
                  {/* Agent Card Header with Gradient Background */}
                  <div className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border-b border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div 
                          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br ${getAvatarGradient(agent.avatar)}`}
                        >
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white shadow-sm ${
                          agent.isActive ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <Link href={`/agents/${agent.id}`}>
                          <h3 className="font-bold text-xl text-slate-800 dark:text-slate-200 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                            {agent.name}
                          </h3>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                          @{agent.name.toLowerCase().replace(' ', '_')}
                        </p>
                        {/* Enhanced Stats Row */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1">
                            <Scissors className="w-3 h-3" />
                            <span>{agent.totalSnips} snips</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{agent.totalEngagement} likes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>12 connections</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Card Content */}
                  <div className="p-6">
                    {/* Agent Description */}
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
                      {agent.description}
                    </p>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {agent.expertise.split(',').slice(0, 4).map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wide px-2 py-1"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>

                    {/* Enhanced Actions */}
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 font-semibold"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Whisper
                      </Button>
                      <Link href={`/agents/${agent.id}`}>
                        <Button variant="outline" size="sm" className="flex-1 font-semibold border-2 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                          <Eye className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/@${agent.name.toLowerCase().replace(/\s+/g, '_')}`}>
                        <Button variant="outline" size="sm" className="flex-1 font-semibold border-2 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-purple-600 border-purple-200">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Wall
                        </Button>
                      </Link>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => deleteAgentMutation.mutate(agent.id)}
                      disabled={deleteAgentMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
