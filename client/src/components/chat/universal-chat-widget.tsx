import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot,
  Plus,
  Search,
  ArrowLeft,
  Minus
} from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "agent";
  content: string;
  createdAt: string;
}

interface Conversation {
  id: number;
  agentId: number;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  agent: {
    id: number;
    name: string;
    avatar: string;
  };
}

interface Agent {
  id: number;
  name: string;
  avatar: string;
  isActive: boolean;
  expertise?: string;
  personality?: string;
}

interface ChatWindow {
  id: string;
  conversationId: number;
  agent: Agent;
  isMinimized: boolean;
}

export default function UniversalChatWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isMainWindowOpen, setIsMainWindowOpen] = useState(false);
  const [mainView, setMainView] = useState<'conversations' | 'new-chat'>('conversations');
  const [chatWindows, setChatWindows] = useState<ChatWindow[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInputs, setMessageInputs] = useState<Record<string, string>>({});
  const messagesEndRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get all user agents
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  // Get all conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  });

  // Get messages for each open chat window using individual queries
  const messageQuery0 = useQuery({
    queryKey: ["/api/conversations", chatWindows[0]?.conversationId, "messages"],
    enabled: !!chatWindows[0]?.conversationId && !chatWindows[0]?.isMinimized,
  });
  
  const messageQuery1 = useQuery({
    queryKey: ["/api/conversations", chatWindows[1]?.conversationId, "messages"],
    enabled: !!chatWindows[1]?.conversationId && !chatWindows[1]?.isMinimized,
  });
  
  const messageQuery2 = useQuery({
    queryKey: ["/api/conversations", chatWindows[2]?.conversationId, "messages"],
    enabled: !!chatWindows[2]?.conversationId && !chatWindows[2]?.isMinimized,
  });
  
  const messageQuery3 = useQuery({
    queryKey: ["/api/conversations", chatWindows[3]?.conversationId, "messages"],
    enabled: !!chatWindows[3]?.conversationId && !chatWindows[3]?.isMinimized,
  });
  
  const messageQuery4 = useQuery({
    queryKey: ["/api/conversations", chatWindows[4]?.conversationId, "messages"],
    enabled: !!chatWindows[4]?.conversationId && !chatWindows[4]?.isMinimized,
  });

  const messageQueries = [messageQuery0, messageQuery1, messageQuery2, messageQuery3, messageQuery4];

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const response = await apiRequest("POST", `/api/conversations`, { agentId });
      return response.json();
    },
    onSuccess: (conversation, agentId) => {
      const agent = agents.find(a => a.id === agentId);
      if (agent) {
        openChatWindow(conversation, agent);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  // Send message mutations for each chat window
  const sendMutation0 = useMutation({
    mutationFn: async (content: string) => {
      const window = chatWindows[0];
      if (!window) return;
      const response = await apiRequest("POST", `/api/conversations/${window.conversationId}/messages`, { 
        content, 
        isFromUser: true 
      });
      return response.json();
    },
    onSuccess: () => {
      const window = chatWindows[0];
      if (!window) return;
      setMessageInputs(prev => ({ ...prev, [window.id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", window.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
  
  const sendMutation1 = useMutation({
    mutationFn: async (content: string) => {
      const window = chatWindows[1];
      if (!window) return;
      const response = await apiRequest("POST", `/api/conversations/${window.conversationId}/messages`, { 
        content, 
        isFromUser: true 
      });
      return response.json();
    },
    onSuccess: () => {
      const window = chatWindows[1];
      if (!window) return;
      setMessageInputs(prev => ({ ...prev, [window.id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", window.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
  
  const sendMutation2 = useMutation({
    mutationFn: async (content: string) => {
      const window = chatWindows[2];
      if (!window) return;
      const response = await apiRequest("POST", `/api/conversations/${window.conversationId}/messages`, { 
        content, 
        isFromUser: true 
      });
      return response.json();
    },
    onSuccess: () => {
      const window = chatWindows[2];
      if (!window) return;
      setMessageInputs(prev => ({ ...prev, [window.id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", window.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
  
  const sendMutation3 = useMutation({
    mutationFn: async (content: string) => {
      const window = chatWindows[3];
      if (!window) return;
      const response = await apiRequest("POST", `/api/conversations/${window.conversationId}/messages`, { 
        content, 
        isFromUser: true 
      });
      return response.json();
    },
    onSuccess: () => {
      const window = chatWindows[3];
      if (!window) return;
      setMessageInputs(prev => ({ ...prev, [window.id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", window.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });
  
  const sendMutation4 = useMutation({
    mutationFn: async (content: string) => {
      const window = chatWindows[4];
      if (!window) return;
      const response = await apiRequest("POST", `/api/conversations/${window.conversationId}/messages`, { 
        content, 
        isFromUser: true 
      });
      return response.json();
    },
    onSuccess: () => {
      const window = chatWindows[4];
      if (!window) return;
      setMessageInputs(prev => ({ ...prev, [window.id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", window.conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
  });

  const sendMessageMutations = [sendMutation0, sendMutation1, sendMutation2, sendMutation3, sendMutation4];

  // Open a new chat window
  const openChatWindow = (conversation: Conversation, agent: Agent) => {
    const windowId = `chat_${conversation.id}`;
    
    // Check if window already exists
    if (chatWindows.find(w => w.id === windowId)) {
      // Just unminimize if it exists
      setChatWindows(prev => prev.map(w => 
        w.id === windowId ? { ...w, isMinimized: false } : w
      ));
      return;
    }

    // Create new window
    const newWindow: ChatWindow = {
      id: windowId,
      conversationId: conversation.id,
      agent,
      isMinimized: false,
    };

    setChatWindows(prev => [...prev, newWindow]);
    setIsMainWindowOpen(false);
  };

  // Close chat window
  const closeChatWindow = (windowId: string) => {
    setChatWindows(prev => prev.filter(w => w.id !== windowId));
  };

  // Minimize/maximize chat window
  const toggleMinimizeWindow = (windowId: string) => {
    setChatWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: !w.isMinimized } : w
    ));
  };

  // Add agent to selection
  const addAgentToChat = (agent: Agent) => {
    if (!selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  // Remove agent from selection
  const removeAgentFromChat = (agentId: number) => {
    setSelectedAgents(selectedAgents.filter(a => a.id !== agentId));
  };

  // Start new chat
  const startNewChat = () => {
    if (selectedAgents.length === 0) return;
    
    const firstAgent = selectedAgents[0];
    createConversationMutation.mutate(firstAgent.id);
    setSelectedAgents([]);
    setSearchQuery("");
  };

  // Open existing conversation
  const openExistingConversation = (conversation: Conversation) => {
    const agent = agents.find(a => a.id === conversation.agentId);
    if (agent) {
      openChatWindow(conversation, agent);
    }
    setIsMainWindowOpen(false);
  };

  // Send message
  const sendMessage = (windowIndex: number) => {
    const window = chatWindows[windowIndex];
    const message = messageInputs[window.id];
    
    if (!message?.trim() || !window) return;
    
    const mutation = sendMessageMutations[windowIndex];
    if (mutation) {
      mutation.mutate(message);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    chatWindows.forEach(window => {
      const messagesEnd = messagesEndRefs.current[window.id];
      if (messagesEnd) {
        messagesEnd.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messageQueries.map(q => q.data)]);

  // Debug logging
  useEffect(() => {
    console.log("Chat Windows:", chatWindows);
    console.log("Message Queries:", messageQueries.map((q, i) => ({
      index: i,
      data: q.data,
      isLoading: q.isLoading,
      isEnabled: q.isEnabled,
      queryKey: q.queryKey
    })));
  }, [chatWindows, messageQueries]);

  const filteredAgents = agents.filter((agent: Agent) => 
    searchQuery === "" || 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv: Conversation) =>
    searchQuery === "" ||
    conv.agent?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return null;

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsMainWindowOpen(!isMainWindowOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        {conversations.some((conv: Conversation) => conv.unreadCount > 0) && (
          <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">
              {conversations.reduce((total: number, conv: Conversation) => total + conv.unreadCount, 0)}
            </span>
          </div>
        )}
      </Button>

      {/* Main chat window (bottom-right positioned) */}
      {isMainWindowOpen && (
        <div className="fixed bottom-24 right-6 z-50">
          <Card className="w-80 h-96 bg-white shadow-2xl border border-gray-200 rounded-lg overflow-hidden">
            {mainView === 'conversations' && (
              <>
                <CardHeader className="p-3 border-b border-gray-100 bg-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Chats</h2>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMainView('new-chat')}
                        className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMainWindowOpen(false)}
                        className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 py-1 text-xs bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-80">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500 mb-2">No conversations yet</p>
                        <Button
                          onClick={() => setMainView('new-chat')}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                        >
                          Start new chat
                        </Button>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredConversations.map((conversation: Conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => openExistingConversation(conversation)}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={conversation.agent?.avatar} alt={conversation.agent?.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                <Bot className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 truncate text-xs">
                                  {conversation.agent?.name}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(conversation.lastMessageAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage || "No messages yet"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white text-xs px-1">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </>
            )}

            {mainView === 'new-chat' && (
              <>
                <CardHeader className="p-3 border-b border-gray-100 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMainView('conversations');
                          setSelectedAgents([]);
                        }}
                        className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-sm font-semibold text-gray-900">New message</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMainWindowOpen(false)}
                      className="h-6 w-6 p-0 text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* To: field */}
                  <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-700">To:</span>
                      <div className="flex flex-wrap gap-1 flex-1">
                        {selectedAgents.map((agent) => (
                          <div
                            key={agent.id}
                            className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{agent.name}</span>
                            <button
                              onClick={() => removeAgentFromChat(agent.id)}
                              className="hover:bg-blue-200 rounded-full p-0.5"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                        {selectedAgents.length === 0 && (
                          <span className="text-xs text-gray-500">Select agents to start chatting</span>
                        )}
                      </div>
                      {selectedAgents.length > 0 && (
                        <Button
                          onClick={startNewChat}
                          disabled={createConversationMutation.isPending}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
                        >
                          {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative mt-2">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 py-1 text-xs bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-80">
                    {filteredAgents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <Bot className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">No agents found</p>
                      </div>
                    ) : (
                      <div className="p-1">
                        {filteredAgents.map((agent: Agent) => {
                          const isSelected = selectedAgents.find(a => a.id === agent.id);
                          return (
                            <div
                              key={agent.id}
                              onClick={() => addAgentToChat(agent)}
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                              }`}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                                  <Bot className="h-3 w-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate text-xs">{agent.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    agent.isActive ? 'bg-green-500' : 'bg-gray-400'
                                  }`} />
                                  <span className="text-xs text-gray-500">
                                    {agent.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Individual chat windows (stacked from right) */}
      {chatWindows.map((window, index) => {
        if (index >= 5) return null; // Limit to 5 windows max
        const messages = messageQueries[index]?.data || [];
        const sendMutation = sendMessageMutations[index];
        
        return (
          <div
            key={window.id}
            className={`fixed bottom-6 z-40 transition-all duration-300`}
            style={{
              right: `${100 + (index * 320)}px`, // Stack windows from right
            }}
          >
            <Card className="w-80 bg-white shadow-xl border border-gray-200 rounded-lg overflow-hidden">
              {/* Chat header */}
              <CardHeader className="p-3 border-b border-gray-100 bg-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={window.agent.avatar} alt={window.agent.name} />
                      <AvatarFallback className="bg-white text-blue-500 text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-white text-sm">{window.agent.name}</h3>
                      <p className="text-xs text-blue-100">
                        {window.agent.isActive ? 'Active now' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMinimizeWindow(window.id)}
                      className="h-6 w-6 p-0 text-blue-100 hover:text-white hover:bg-blue-600"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => closeChatWindow(window.id)}
                      className="h-6 w-6 p-0 text-blue-100 hover:text-white hover:bg-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat messages */}
              {!window.isMinimized && (
                <CardContent className="p-0 flex flex-col">
                  <ScrollArea className="h-80">
                    <div className="p-3 space-y-2">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <MessageSquare className="h-6 w-6 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">No messages yet</p>
                          <p className="text-xs text-gray-400">Start the conversation below</p>
                        </div>
                      ) : (
                        messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs ${
                                message.sender === "user"
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={el => messagesEndRefs.current[window.id] = el} />
                    </div>
                  </ScrollArea>

                  {/* Message input */}
                  <div className="border-t border-gray-100 p-3">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageInputs[window.id] || ""}
                        onChange={(e) => setMessageInputs(prev => ({ 
                          ...prev, 
                          [window.id]: e.target.value 
                        }))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(index);
                          }
                        }}
                        className="flex-1 text-xs border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        onClick={() => sendMessage(index)}
                        disabled={!messageInputs[window.id]?.trim() || sendMutation.isPending}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1"
                      >
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        );
      })}
    </>
  );
}