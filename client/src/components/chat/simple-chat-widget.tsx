import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, X, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ChatWindow from "./chat-window";
import type { Agent, Conversation } from "@/shared/schema";

interface ChatWindowState {
  id: string;
  conversationId: number;
  agent: Agent;
  isMinimized: boolean;
}

export default function SimpleChatWidget() {
  const { user } = useAuth();
  const [isMainWindowOpen, setIsMainWindowOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState<ChatWindowState[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's agents
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  // Fetch user's conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Filter agents and conversations based on search
  const filteredAgents = agents.filter((agent: Agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv: Conversation) => {
    const agent = agents.find((a: Agent) => a.id === conv.agentId);
    return agent?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openChatWindow = (conversationId: number, agent: Agent) => {
    const windowId = `chat_${conversationId}`;
    
    // Check if window already exists
    const existingWindow = chatWindows.find(w => w.id === windowId);
    if (existingWindow) {
      // Unminimize if it exists
      setChatWindows(prev => prev.map(w => 
        w.id === windowId ? { ...w, isMinimized: false } : w
      ));
      return;
    }

    // Create new window
    const newWindow: ChatWindowState = {
      id: windowId,
      conversationId,
      agent,
      isMinimized: false,
    };

    setChatWindows(prev => [...prev, newWindow]);
    setIsMainWindowOpen(false);
  };

  const minimizeWindow = (windowId: string) => {
    setChatWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  };

  const closeWindow = (windowId: string) => {
    setChatWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const startNewConversation = async (agent: Agent) => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ agentId: agent.id }),
      });
      
      if (response.ok) {
        const conversation = await response.json();
        openChatWindow(conversation.id, agent);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const openExistingConversation = (conversation: Conversation) => {
    const agent = agents.find((a: Agent) => a.id === conversation.agentId);
    if (agent) {
      openChatWindow(conversation.id, agent);
    }
  };

  // Don't render if not authenticated
  if (!user) return null;

  return (
    <>
      {/* Main Chat Button */}
      <Button
        onClick={() => setIsMainWindowOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Main Chat Window */}
      {isMainWindowOpen && (
        <Card className="fixed bottom-4 right-4 w-80 h-96 bg-white shadow-lg border border-gray-200 z-50">
          <CardHeader className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMainWindowOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-2">
                {/* Recent Conversations */}
                {filteredConversations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 px-2">Recent Conversations</h4>
                    <div className="space-y-1">
                      {filteredConversations.map((conversation: Conversation) => {
                        const agent = agents.find((a: Agent) => a.id === conversation.agentId);
                        if (!agent) return null;
                        
                        return (
                          <div
                            key={conversation.id}
                            onClick={() => openExistingConversation(conversation)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={agent.avatar} alt={agent.name} />
                              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{agent.name}</p>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage || "No messages"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="secondary" className="h-5 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Available Agents */}
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2 px-2">Available Agents</h4>
                  <div className="space-y-1">
                    {filteredAgents.map((agent: Agent) => (
                      <div
                        key={agent.id}
                        onClick={() => startNewConversation(agent)}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar} alt={agent.name} />
                          <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.expertise}</p>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Chat Windows */}
      {chatWindows.map((window, index) => (
        <ChatWindow
          key={window.id}
          conversationId={window.conversationId}
          agent={window.agent}
          position={index}
          onMinimize={() => minimizeWindow(window.id)}
          onClose={() => closeWindow(window.id)}
        />
      ))}

      {/* Minimized Chat Indicators */}
      {chatWindows.filter(w => w.isMinimized).map((window, index) => (
        <Button
          key={`minimized-${window.id}`}
          onClick={() => minimizeWindow(window.id)}
          className="fixed bottom-4 h-8 px-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
          style={{ right: `${20 + index * 120}px` }}
        >
          <Avatar className="h-4 w-4 mr-1">
            <AvatarImage src={window.agent.avatar} alt={window.agent.name} />
            <AvatarFallback className="text-xs">{window.agent.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {window.agent.name}
        </Button>
      ))}
    </>
  );
}