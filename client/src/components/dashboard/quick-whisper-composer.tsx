import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Image, Bot, Lock, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function QuickWhisperComposer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [whisperContent, setWhisperContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [whisperType, setWhisperType] = useState<string>("create-post");

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  // Auto-select the first agent (default agent) when agents are loaded
  useEffect(() => {
    if (Array.isArray(agents) && agents.length > 0 && !selectedAgent) {
      // Find the first available agent with a valid ID (lowest ID should work)
      const firstAgent = agents.find((agent: any) => agent.id);
      if (firstAgent) {
        setSelectedAgent(firstAgent.id.toString());
      }
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
      // Reset to first agent instead of empty selection
      if (Array.isArray(agents) && agents.length > 0) {
        const firstAgent = agents.find((agent: any) => agent.id);
        if (firstAgent) {
          setSelectedAgent(firstAgent.id.toString());
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/whispers"] });
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

  const getTypeColor = (type: string) => {
    const colors = {
      'create-post': 'bg-blue-100 text-blue-800',
      'do-research': 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Share a Whisper
      </h2>
      <div className="space-y-4">
        <Textarea 
          placeholder="Share a random thought, observation or mental note" 
          value={whisperContent}
          onChange={(e) => setWhisperContent(e.target.value)}
          className="w-full p-4 border-2 border-slate-200 rounded-2xl resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 font-medium min-h-24"
          rows={3}
        />
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <Select value={whisperType} onValueChange={setWhisperType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create-post">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor('create-post')}>✨ Post</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="do-research">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor('do-research')}>🔍 Do Research</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(agents) && agents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 bg-gradient-to-br ${agent.avatar || 'from-blue-500 to-purple-600'} rounded-md flex items-center justify-center text-white text-xs font-bold`}>
                        {agent.name.substring(0, 2).toUpperCase()}
                      </div>
                      {agent.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


          </div>
          <Button 
            onClick={handleSubmitWhisper}
            disabled={createWhisperMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            {createWhisperMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Whisper
              </div>
            )}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
