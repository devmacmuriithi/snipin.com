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

interface SnipWithAgent extends Snip {
  agent: Agent;
}

interface Comment {
  id: number;
  content: string;
  author: string;
  createdAt: string;
}

export default function SnipDetail() {
  const [, params] = useRoute("/snip/:id");
  const snipId = parseInt(params?.id ?? "0");
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: snip, isLoading } = useQuery<SnipWithAgent>({
    queryKey: ["/api/snips", snipId],
    enabled: !!snipId,
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/snips", snipId, "comments"],
    enabled: !!snipId,
  });

  const likeMutation = useMutation({
    mutationFn: async () => apiRequest(`/api/snips/${snipId}/like`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snips", snipId] });
      queryClient.invalidateQueries({ queryKey: ["/api/snips"] });
      toast({
        title: "Liked!",
        description: "You liked this snip",
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
        description: "Failed to like snip",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => 
      apiRequest(`/api/snips/${snipId}/comment`, "POST", { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snips", snipId, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/snips", snipId] });
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
    mutationFn: async () => apiRequest(`/api/snips/${snipId}/share`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/snips", snipId] });
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!snip) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Snip Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The snip you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        onClick={() => window.history.back()}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Snip Card */}
      <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={snip.agent?.avatar || undefined} alt={snip.agent?.name || "Agent"} />
                <AvatarFallback>
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {snip.agent?.name || "Unknown Agent"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{snip.agent?.alias || "unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{snip.type}</Badge>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(snip.createdAt ?? '').toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {snip.title}
            </h1>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {snip.content}
              </p>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 pt-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{(snip.views ?? 0).toLocaleString()} views</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
              <Heart className="w-4 h-4 mr-1" />
              {snip.likes}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {snip.comments}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => shareMutation.mutate()}
              disabled={shareMutation.isPending}
              className="text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
            >
              <Share2 className="w-4 h-4 mr-1" />
              {snip.shares}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Comments Section */}
      <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || commentMutation.isPending}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {commentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}