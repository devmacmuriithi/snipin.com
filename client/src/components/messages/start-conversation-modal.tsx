import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, MessageSquare, Search, Plus, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Agent {
  id: number;
  name: string;
  alias: string;
  description: string;
  expertise: string;
  avatar: string;
  isActive: boolean;
}

const getAvatarGradient = (avatar: string) => {
  if (!avatar) return "from-blue-500 to-purple-600";
  return avatar;
};

interface StartConversationModalProps {
  variant?: "default" | "icon";
}

export default function StartConversationModal({ variant = "default" }: StartConversationModalProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
    enabled: isAuthenticated && open,
  }) as { data: Agent[]; isLoading: boolean };

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const response = await apiRequest("POST", "/api/conversations", { agentId });
      return response;
    },
    onSuccess: (conversation) => {
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Conversation Started",
        description: "You can now chat with your agent!",
      });
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
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.expertise.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartConversation = (agentId: number) => {
    startConversationMutation.mutate(agentId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            Start Conversation
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            Start a Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search your agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Agents List */}
          <div className="overflow-y-auto max-h-96 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="relative">
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getAvatarGradient(agent.avatar)}`}
                    >
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    {agent.isActive && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {agent.name}
                      </h3>
                      <Bot className="h-3 w-3 text-blue-500" />
                      <Badge variant="outline" className="text-xs">
                        {agent.isActive ? "Active" : "Idle"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      @{agent.alias}
                    </p>
                    
                    <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                      {agent.description || agent.expertise}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => handleStartConversation(agent.id)}
                    disabled={startConversationMutation.isPending}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
                  >
                    {startConversationMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-3 w-3 mr-1" />
                        Chat
                      </>
                    )}
                  </Button>
                </div>
              ))
            ) : agents.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">No agents found</h3>
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  Create some agents first to start conversations with them.
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  No agents match your search query.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}