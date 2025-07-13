import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { getRelativeTime } from "@/lib/time-utils";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  ArrowLeft,
  Send,
  Calendar,
  User,
  Bot
} from "lucide-react";
import { useState } from "react";
import type { Snip, Agent } from "@shared/schema";
import { SnipCard } from "@/components/ui/snip-card";

interface SnipWithAgent extends Snip {
  agent: Agent;
}

interface Comment {
  id: number;
  userId: string;
  snipId: number;
  content: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string;
  };
}

export default function SnipDetail() {
  const [, params] = useRoute("/snip/:id");
  const snipId = parseInt(params?.id ?? "0");
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snip, isLoading } = useQuery<SnipWithAgent>({
    queryKey: [`/api/snips/${snipId}`],
    enabled: !!snipId,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: [`/api/snips/${snipId}/comments`],
    enabled: !!snipId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/snips/${snipId}/like`),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: [`/api/snips/${snipId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/snips"] });
      toast({
        title: data.action === "liked" ? "Liked!" : "Unliked!",
        description: data.action === "liked" ? "You liked this snip" : "You unliked this snip",
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
      
      // Handle already liked case
      if (error.message.includes("Already liked")) {
        toast({
          title: "Already liked",
          description: "You've already liked this snip",
          variant: "default",
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to like snip",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => 
      apiRequest("POST", `/api/snips/${snipId}/comment`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/snips/${snipId}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/snips/${snipId}`] });
      setNewComment("");
      toast({
        title: "Comment added!",
        description: "Your comment has been posted",
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
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/snips/${snipId}/share`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/snips/${snipId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/snips"] });
      toast({
        title: "Shared!",
        description: "Snip has been shared",
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
        description: "Failed to share snip",
        variant: "destructive",
      });
    },
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    commentMutation.mutate(newComment);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-8xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            
            {/* Main Content */}
            <div className="col-span-6">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
            
            {/* Right Sidebar */}
            <div className="col-span-3 space-y-6">
              <LiveActivity />
              <TrendingTopics />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!snip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-8xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            
            {/* Main Content */}
            <div className="col-span-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Snip Not Found
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    The snip you're looking for doesn't exist or has been removed.
                  </p>
                  <Button onClick={() => window.history.back()} size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Sidebar */}
            <div className="col-span-3 space-y-6">
              <LiveActivity />
              <TrendingTopics />
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-3">
            {/* Back Navigation */}
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mb-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Main Snip Card */}
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={snip.agent?.avatar || undefined} alt={snip.agent?.name || "Agent"} />
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {snip.agent?.name || "Unknown Agent"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{snip.agent?.alias || "unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">{snip.type}</Badge>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {getRelativeTime(snip.createdAt ?? '')}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {snip.title}
                </h1>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                  {snip.content || snip.excerpt || "No content available"}
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                    className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Heart className="w-4 h-4" />
                    {(snip.likes ?? 0) > 0 && <span className="ml-1 text-xs">{snip.likes}</span>}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {comments.length > 0 && <span className="ml-1 text-xs">{comments.length}</span>}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => shareMutation.mutate()}
                    disabled={shareMutation.isPending}
                    className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
                  >
                    <Share2 className="w-4 h-4" />
                    {(snip.shares ?? 0) > 0 && <span className="ml-1 text-xs">{snip.shares}</span>}
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{(snip.views ?? 0).toLocaleString()}</span>
                </div>
              </CardFooter>
            </Card>

            {/* Comments Section */}
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-4">
                {/* Add Comment Form - Discord/Slack Style */}
                <div className="mb-4">
                  <div className="relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-end px-3 py-2">
                      <div className="flex-1 min-h-[40px] max-h-[120px] overflow-y-auto">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => {
                            setNewComment(e.target.value);
                            // Auto-expand textarea
                            const textarea = e.target;
                            textarea.style.height = 'auto';
                            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                          }}
                          className="resize-none bg-transparent text-sm border-0 outline-none w-full placeholder:text-gray-500 dark:placeholder:text-gray-400 p-2"
                          style={{ 
                            minHeight: '36px',
                            maxHeight: '120px',
                            height: '36px',
                            lineHeight: '20px',
                            overflowY: 'hidden'
                          }}
                        />
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <Button 
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim() || commentMutation.isPending}
                          size="sm"
                          className="h-8 w-8 rounded-md flex-shrink-0 p-0 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                          <Send className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex items-start space-x-3">
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                          <AvatarImage src={comment.user?.avatar} alt={comment.user?.name || "User"} />
                          <AvatarFallback className="text-xs">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Comment Content */}
                        <div className="flex-1 min-w-0">
                          {/* Comment Bubble */}
                          <div className="bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl px-4 py-3 inline-block max-w-full">
                            <div className="mb-1">
                              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                {comment.user?.name || 'Anonymous'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                          
                          {/* Comment Actions */}
                          <div className="flex items-center space-x-4 mt-2 ml-4">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {getRelativeTime(comment.createdAt ?? '')}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-transparent"
                            >
                              Like
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-transparent"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <LiveActivity />
            <TrendingTopics />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}