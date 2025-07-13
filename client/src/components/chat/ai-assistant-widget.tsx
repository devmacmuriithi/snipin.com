import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot
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

interface AgentChatWidgetProps {
  agentId: number;
  agentName: string;
  agentAvatar: string;
}

export default function AgentChatWidget({ agentId, agentName, agentAvatar }: AgentChatWidgetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get conversations for this agent
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations", agentId],
    queryFn: async () => {
      const allConversations = await apiRequest('/api/conversations');
      return allConversations.filter((conv: Conversation) => conv.agentId === agentId);
    },
    enabled: !!user && isOpen,
  });

  // Get messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Create or get conversation with agent
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/conversations`, {
        method: "POST",
        body: { agentId }
      });
    },
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", agentId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", agentId] });
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

  const startNewChat = () => {
    createConversationMutation.mutate();
  };

  const openConversation = (conversationId: number) => {
    setSelectedConversation(conversationId);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-white shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200"
        variant="outline"
      >
        <MessageSquare className="h-6 w-6 text-gray-600" />
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
          <Card className="relative w-96 h-[500px] bg-white shadow-2xl border-0 rounded-xl overflow-hidden">
            {!selectedConversation ? (
              // Conversation list or start new chat
              <>
                <CardHeader className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={agentAvatar} alt={agentName} />
                        <AvatarFallback className={`text-white bg-gradient-to-r ${agentAvatar || 'from-blue-500 to-purple-600'}`}>
                          <Bot className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{agentName}</h3>
                        <p className="text-sm text-gray-500">
                          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                        </p>
                      </div>
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
                  {conversations.length === 0 ? (
                    // No conversations - show start new chat
                    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
                      <div className="text-center space-y-2">
                        <h4 className="font-medium text-gray-900">Start a conversation</h4>
                        <p className="text-sm text-gray-500">
                          Send a message to {agentName} to get started
                        </p>
                      </div>
                      <Button
                        onClick={startNewChat}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        New message
                      </Button>
                    </div>
                  ) : (
                    // Show conversations list
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">Recent conversations</h4>
                          <Button
                            onClick={startNewChat}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            New
                          </Button>
                        </div>
                        
                        {conversations.map((conv: Conversation) => (
                          <div
                            key={conv.id}
                            onClick={() => openConversation(conv.id)}
                            className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  <Bot className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {conv.agent.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {conv.lastMessage}
                                </p>
                              </div>
                              {conv.unreadCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  {conv.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              // Chat interface
              <>
                <CardHeader className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={agentAvatar} alt={agentName} />
                        <AvatarFallback className={`text-white bg-gradient-to-r ${agentAvatar || 'from-blue-500 to-purple-600'}`}>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-gray-900">{agentName}</h3>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversation(null)}
                        className="h-8 w-8 p-0"
                      >
                        ←
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
                </CardHeader>

                <CardContent className="p-0 flex flex-col h-full">
                  {/* Messages area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message: Message) => (
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
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

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