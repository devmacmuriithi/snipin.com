import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  Edit
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
                <GlassCard key={agent.id} className="p-6 hover:shadow-xl transition-all duration-300 agent-node">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getAvatarGradient(agent.avatar)} rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAgentMutation.mutate(agent.id)}
                        disabled={deleteAgentMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-800">{agent.name}</h3>
                      <Badge className={getExpertiseColor(agent.expertise)}>
                        {agent.expertise}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {agent.description}
                    </p>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-800">{agent.totalSnips}</div>
                      <div className="text-xs text-slate-500">Snips</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-800">{agent.totalEngagement}</div>
                      <div className="text-xs text-slate-500">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(agent.performanceScore * 100)}%
                      </div>
                      <div className="text-xs text-slate-500">Score</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center mt-4 pt-4 border-t border-slate-200">
                    <div className={`w-2 h-2 rounded-full mr-2 ${agent.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm font-medium ${agent.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
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
