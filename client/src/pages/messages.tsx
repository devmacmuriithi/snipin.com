import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  MessageCircle, 
  Send, 
  Bot, 
  Clock, 
  CheckCircle2,
  MoreHorizontal,
  Settings,
  Plus,
  Star,
  Archive
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import StartConversationModal from "@/components/messages/start-conversation-modal";

interface Conversation {
  id: number;
  userId: string;
  agentId: number;
  lastMessageAt: string;
  unreadCount: number;
  agent?: {
    id: number;
    name: string;
    alias: string;
    avatar: string;
    isActive: boolean;
  };
  lastMessage?: {
    id: number;
    content: string;
    isFromUser: boolean;
    createdAt: string;
  };
}

interface Message {
  id: number;
  conversationId: number;
  content: string;
  isFromUser: boolean;
  createdAt: string;
}

const getAvatarGradient = (avatar: string) => {
  if (!avatar) return "from-blue-500 to-purple-600";
  return avatar;
};

export default function Messages() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to view messages.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
  }) as { data: Conversation[]; isLoading: boolean };

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/conversations/${selectedConversation?.id}/messages`],
    enabled: !!selectedConversation?.id && isAuthenticated,
  }) as { data: Message[]; isLoading: boolean };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { conversationId: number; content: string }) => {
      await apiRequest("POST", `/api/conversations/${data.conversationId}/messages`, {
        content: data.content,
        isFromUser: true,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/conversations/${selectedConversation?.id}/messages`] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
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
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
    });
  };

  if (authLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
        <NavigationSidebar />
        <div className="flex-1 ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const filteredConversations = conversations.filter(conv => 
    conv.agent?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.agent?.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <NavigationSidebar />
      
      {/* Messages Layout */}
      <div className="fixed top-0 left-64 right-0 bottom-0 flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl flex-shrink-0">
          {/* Header */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">Messages</h1>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <StartConversationModal variant="icon" />
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search Direct Messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-100 dark:bg-slate-800 border-none"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="overflow-y-auto flex-1">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id 
                      ? "bg-blue-50/50 dark:bg-blue-900/20 border-r-2 border-r-blue-500" 
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getAvatarGradient(conversation.agent?.avatar || "")}`}
                      >
                        {conversation.agent?.name.charAt(0).toUpperCase()}
                      </div>
                      {conversation.agent?.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {conversation.agent?.name}
                          </h3>
                          <Bot className="h-3 w-3 text-blue-500" />
                        </div>
                        <div className="flex items-center gap-1">
                          {conversation.lastMessage && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatDistanceToNow(new Date(conversation.lastMessageAt))}
                            </span>
                          )}
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs min-w-[18px] h-[18px] flex items-center justify-center p-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        @{conversation.agent?.alias}
                      </p>
                      
                      {conversation.lastMessage && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 truncate mt-1">
                          {conversation.lastMessage.isFromUser ? "You: " : ""}
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No conversations yet</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                  Start a conversation with one of your agents to see it here.
                </p>
                <StartConversationModal />
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="flex-shrink-0 p-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg bg-gradient-to-br ${getAvatarGradient(selectedConversation.agent?.avatar || "")}`}
                      >
                        {selectedConversation.agent?.name.charAt(0).toUpperCase()}
                      </div>
                      {selectedConversation.agent?.isActive && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-800 dark:text-slate-200">
                          {selectedConversation.agent?.name}
                        </h2>
                        <Bot className="h-4 w-4 text-blue-500" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        @{selectedConversation.agent?.alias} • {selectedConversation.agent?.isActive ? "Active" : "Idle"}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 pl-12 space-y-4 min-h-0">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${message.isFromUser ? "order-2" : "order-1"}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            message.isFromUser
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${message.isFromUser ? "justify-end" : "justify-start"}`}>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDistanceToNow(new Date(message.createdAt))} ago
                          </span>
                          {message.isFromUser && (
                            <CheckCircle2 className="h-3 w-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Start the conversation</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Send a message to begin chatting with {selectedConversation.agent?.name}.
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="flex-shrink-0 p-4 pl-12 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`Message ${selectedConversation.agent?.name}...`}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="min-h-[44px] resize-none bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 h-[44px]"
                  >
                    {sendMessageMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Welcome Screen */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Select a conversation
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Choose a conversation from your message list to start chatting with your AI agents.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}