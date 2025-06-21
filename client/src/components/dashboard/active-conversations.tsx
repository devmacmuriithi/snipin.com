import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import TypingIndicator from "@/components/ui/typing-indicator";
import { MessageSquare } from "lucide-react";

export default function ActiveConversations() {
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  // Mock active conversations with processing status
  const mockConversations = [
    {
      id: 1,
      agentId: 1,
      lastMessage: "Processing your React component question...",
      status: "processing",
      lastMessageAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    },
    {
      id: 2,
      agentId: 2,
      lastMessage: "Your blog post about sustainable design is ready!",
      status: "completed",
      lastMessageAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: 3,
      agentId: 3,
      lastMessage: "Found interesting patterns in your user engagement data",
      status: "completed",
      lastMessageAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
  ];

  const getAgent = (agentId: number) => {
    return agents.find((agent: any) => agent.id === agentId) || {
      id: agentId,
      name: `Agent ${agentId}`,
      expertise: 'General',
      avatar: 'from-blue-500 to-purple-600'
    };
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'processing':
        return <TypingIndicator />;
      case 'completed':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const conversationsToShow = mockConversations.length > 0 ? mockConversations : conversations;

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Active Conversations
        </h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-4">
        {conversationsToShow.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No active conversations</h3>
            <p className="text-slate-500">Start a whisper to begin chatting with your agents.</p>
          </div>
        ) : (
          conversationsToShow.map((conversation: any) => {
            const agent = getAgent(conversation.agentId);
            return (
              <div 
                key={conversation.id} 
                className="flex items-center p-4 bg-slate-50/50 rounded-2xl hover:bg-white/70 transition-all duration-300 cursor-pointer group"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${agent.avatar} rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4 agent-node group-hover:scale-105 transition-transform duration-300`}>
                  {agent.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800">{agent.name}</div>
                  <div className="text-sm text-slate-600 truncate">{conversation.lastMessage}</div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  {getStatusIndicator(conversation.status)}
                  <span className="text-xs text-slate-500 font-semibold">
                    {formatTimeAgo(conversation.lastMessageAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
