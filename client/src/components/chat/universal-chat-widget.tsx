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
  ArrowLeft
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
}

export default function UniversalChatWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'conversations' | 'new-chat' | 'chat'>('conversations');
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all user agents
  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user && isOpen,
  });

  // Get all conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user && isOpen,
  });

  // Get messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation && view === 'chat',
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (agentId: number) => {
      console.log("Creating conversation with agent ID:", agentId);
      const response = await apiRequest(`/api/conversations`, {
        method: "POST",
        body: { agentId }
      });
      console.log("Conversation created:", response);
      return response;
    },
    onSuccess: (conversation) => {
      console.log("Conversation success:", conversation);
      setSelectedConversation(conversation.id);
      setView('chat');
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      console.error("Error creating conversation:", error);
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: { conversationId: number; content: string }) => {
      return await apiRequest(`/api/conversations/${message.conversationId}/messages`, {
        method: "POST",
        body: { content: message.content, isFromUser: true }
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error) => {
      console.error("Error sending message:", error);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage
    });
  };

  const addAgentToChat = (agent: Agent) => {
    if (!selectedAgents.find(a => a.id === agent.id)) {
      setSelectedAgents([...selectedAgents, agent]);
    }
  };

  const removeAgentFromChat = (agentId: number) => {
    setSelectedAgents(selectedAgents.filter(a => a.id !== agentId));
  };

  const startNewChat = () => {
    console.log("startNewChat called");
    console.log("selectedAgents:", selectedAgents);
    
    if (selectedAgents.length === 0) {
      console.log("No agents selected, returning");
      return;
    }
    
    // For now, start with the first agent (can be extended for group chats)
    const firstAgent = selectedAgents[0];
    console.log("First agent:", firstAgent);
    
    setSelectedAgent(firstAgent);
    setSearchQuery(""); 
    console.log("Starting chat with agent:", firstAgent.id);
    createConversationMutation.mutate(firstAgent.id);
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    setSelectedAgent(conversation.agent);
    setSelectedAgents([conversation.agent]);
    setSearchQuery(""); 
    setView('chat');
  };

  const filteredAgents = agents.filter((agent: Agent) => 
    searchQuery === "" || 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter((conv: Conversation) =>
    searchQuery === "" ||
    conv.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.lastMessage && conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!user) return null;

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(true)}
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

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Chat container */}
          <Card className="relative w-96 h-[600px] bg-white shadow-2xl border-0 rounded-xl overflow-hidden">
            {view === 'conversations' && (
              <>
                <CardHeader className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView('new-chat')}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Search bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[480px]">
                    {filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">No conversations yet</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Start chatting with your AI agents
                        </p>
                        <Button
                          onClick={() => setView('new-chat')}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Start new chat
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredConversations.map((conversation: Conversation) => (
                          <div
                            key={conversation.id}
                            onClick={() => openConversation(conversation)}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={conversation.agent.avatar} alt={conversation.agent.name} />
                              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                <Bot className="h-5 w-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {conversation.agent.name}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(conversation.lastMessageAt).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {conversation.lastMessage || "No messages yet"}
                              </p>
                            </div>
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-blue-500 text-white">
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

            {view === 'new-chat' && (
              <>
                <CardHeader className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setView('conversations');
                          setSelectedAgents([]);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <h2 className="text-lg font-semibold text-gray-900">New message</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* To: field with selected agents */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">To:</span>
                      <div className="flex flex-wrap gap-2 flex-1">
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
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {selectedAgents.length === 0 && (
                          <span className="text-sm text-gray-500">Select agents to start chatting</span>
                        )}
                      </div>
                      {selectedAgents.length > 0 && (
                        <Button
                          onClick={startNewChat}
                          disabled={createConversationMutation.isPending}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3"
                        >
                          {createConversationMutation.isPending ? "Creating..." : "Start Chat"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Search bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search agents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <ScrollArea className="h-[480px]">
                    {filteredAgents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <Bot className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">No agents found</h3>
                        <p className="text-sm text-gray-500">
                          {searchQuery ? "Try adjusting your search" : "You don't have any agents yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {filteredAgents.map((agent: Agent) => {
                          const isSelected = selectedAgents.find(a => a.id === agent.id);
                          return (
                            <div
                              key={agent.id}
                              onClick={() => addAgentToChat(agent)}
                              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-gray-50'
                              }`}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={agent.avatar} alt={agent.name} />
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                                  <Bot className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">{agent.name}</h4>
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    agent.isActive ? 'bg-green-500' : 'bg-gray-400'
                                  }`} />
                                  <span className="text-xs text-gray-500">
                                    {agent.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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

            {view === 'chat' && selectedAgent && (
              <>
                <CardHeader className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setView('conversations');
                        setSelectedAgents([]);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{selectedAgent.name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedAgent.isActive ? 'Active now' : 'Last seen recently'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0 flex flex-col h-full">
                  {/* Messages area */}
                  <ScrollArea className="flex-1 h-[400px]">
                    <div className="p-4 space-y-3">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                          <MessageSquare className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">No messages yet</p>
                          <p className="text-xs text-gray-400">Start the conversation below</p>
                        </div>
                      ) : (
                        messages.map((message: Message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
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
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message input */}
                  <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}