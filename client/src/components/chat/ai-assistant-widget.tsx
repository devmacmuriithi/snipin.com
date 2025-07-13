import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  X, 
  Minus, 
  Plus, 
  Send, 
  User, 
  RotateCcw, 
  MessageSquare,
  Sparkles,
  BarChart3,
  Target
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

export default function AIAssistantWidget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [personalAssistant, setPersonalAssistant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Get user's personal assistant
  const { data: agents } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  useEffect(() => {
    if (agents && agents.length > 0) {
      // Find personal assistant (should be first due to ordering)
      const assistant = agents.find((agent: any) => agent.isPersonalAssistant) || agents[0];
      setPersonalAssistant(assistant);
    }
  }, [agents]);

  // Get conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user && isOpen,
  });

  // Get messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  // Create or get conversation with personal assistant
  const createConversationMutation = useMutation({
    mutationFn: async (agentId: number) => {
      return await apiRequest(`/api/conversations`, {
        method: "POST",
        body: { agentId }
      });
    },
    onSuccess: (conversation) => {
      setSelectedConversation(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === widgetRef.current || (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && widgetRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep widget within viewport
      const maxX = window.innerWidth - widgetRef.current.offsetWidth;
      const maxY = window.innerHeight - widgetRef.current.offsetHeight;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage
    });
  };

  const startNewChat = () => {
    if (personalAssistant) {
      createConversationMutation.mutate(personalAssistant.id);
    }
  };

  const getQuickActions = () => [
    { icon: Sparkles, label: "Give Insights", message: "Can you analyze my recent activity and provide insights?" },
    { icon: Target, label: "Set Goals", message: "Help me set and track some personal or professional goals." },
    { icon: BarChart3, label: "Summarize Tasks", message: "Summarize my current tasks and priorities." }
  ];

  if (!user || !personalAssistant) return null;

  return (
    <div
      ref={widgetRef}
      className="fixed z-50 select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      {!isOpen ? (
        // Collapsed floating button
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/20"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      ) : (
        // Expanded chat widget
        <Card className="w-80 h-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader className="drag-handle p-3 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={personalAssistant.avatar} alt={personalAssistant.name} />
                    <AvatarFallback className={`text-white bg-gradient-to-r ${personalAssistant.avatar || 'from-blue-500 to-purple-600'}`}>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">AI Assistant</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{conversations.length} conversations</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-gray-800/50"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-full flex flex-col">
            {!selectedConversation ? (
              // Conversation list or welcome screen
              <div className="flex-1 p-4 space-y-3">
                <div className="text-center space-y-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {conversations.length === 0 ? "No tasks due today" : "Recent conversations"}
                  </div>
                  <Button
                    onClick={startNewChat}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>

                {conversations.length === 0 ? (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Currently, there are no tasks in your workspace. To create a new task for editing the home page, you can follow these steps:
                    </p>
                    <div className="text-left space-y-2">
                      {getQuickActions().map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            startNewChat();
                            setNewMessage(action.message);
                          }}
                          className="w-full justify-start text-xs h-8"
                        >
                          <action.icon className="h-3 w-3 mr-2" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv: Conversation) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              <Bot className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{conv.agent.name}</p>
                            <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
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
                )}
              </div>
            ) : (
              // Chat interface
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.map((message: Message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-2 rounded-lg text-sm ${
                          message.sender === "user"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message input */}
                <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-3">
                  <div className="flex items-center space-x-2">
                    <Textarea
                      placeholder="Ask your AI assistant anything..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-sm resize-none bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      rows={1}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Back button */}
                <div className="px-3 pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Back to conversations
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}