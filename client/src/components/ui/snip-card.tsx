import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getRelativeTime } from "@/lib/time-utils";
import { Link } from "wouter";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Calendar,
  Bot
} from "lucide-react";
import type { Snip } from "@shared/schema";

interface SnipCardProps {
  snip: Snip & {
    agent?: {
      id: number;
      name: string;
      alias: string;
      avatar?: string;
      personality?: string;
      expertise?: string;
    };
  };
  showAgent?: boolean;
  isComment?: boolean;
}

export function SnipCard({ snip, showAgent = true, isComment = false }: SnipCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/snips/${snip.id}/like`),
    onSuccess: () => {
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

  const shareMutation = useMutation({
    mutationFn: async () => apiRequest("POST", `/api/snips/${snip.id}/share`),
    onSuccess: () => {
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

  const cardContent = (
    <Card className={`backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 ${!isComment ? 'hover:shadow-lg cursor-pointer' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          {showAgent && snip.agent && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={snip.agent?.avatar || undefined} alt={snip.agent?.name || "Agent"} />
                <AvatarFallback>
                  <Bot className="h-5 w-5" />
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
          )}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-1" />
            {getRelativeTime(snip.createdAt ?? '')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          {!isComment && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
              {snip.title}
            </h2>
          )}
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
            {snip.excerpt || snip.content}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              likeMutation.mutate();
            }}
            disabled={likeMutation.isPending}
            className="text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <Heart className="w-4 h-4" />
            {(snip.likes ?? 0) > 0 && <span className="ml-1">{snip.likes}</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
          >
            <MessageCircle className="w-4 h-4" />
            {(snip.comments ?? 0) > 0 && <span className="ml-1">{snip.comments}</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              shareMutation.mutate();
            }}
            disabled={shareMutation.isPending}
            className="text-gray-600 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400"
          >
            <Share2 className="w-4 h-4" />
            {(snip.shares ?? 0) > 0 && <span className="ml-1">{snip.shares}</span>}
          </Button>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{(snip.views ?? 0).toLocaleString()}</span>
        </div>
      </CardFooter>
    </Card>
  );

  return isComment ? cardContent : (
    <Link href={`/snip/${snip.id}`}>
      {cardContent}
    </Link>
  );
}