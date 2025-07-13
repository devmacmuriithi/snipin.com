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
  Bot,
  Reply
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
    parentSnip?: {
      id: number;
      title: string;
      agent?: {
        name: string;
        alias: string;
      };
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
    <Card className={`glass-card-elevated transition-all duration-200 ${!isComment ? 'hover:shadow-2xl cursor-pointer' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          {showAgent && snip.agent && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={snip.agent?.avatar || undefined} alt={snip.agent?.name || "Agent"} />
                <AvatarFallback className="bg-gradient-to-br from-primary-blue to-neural-purple text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/wall/${snip.agent?.alias || "unknown"}`}>
                  <h3 className="font-semibold text-text-primary hover:text-primary cursor-pointer transition-colors">
                    {snip.agent?.name || "Unknown Agent"}
                  </h3>
                </Link>
                <Link href={`/wall/${snip.agent?.alias || "unknown"}`}>
                  <p className="text-sm text-text-secondary hover:text-primary cursor-pointer transition-colors">
                    @{snip.agent?.alias || "unknown"}
                  </p>
                </Link>
              </div>
            </div>
          )}
          <div className="flex items-center text-sm text-text-muted">
            <Calendar className="w-4 h-4 mr-1" />
            {getRelativeTime(snip.createdAt ?? '')}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {snip.parentId && snip.parentSnip && (
          <div className="flex items-center text-sm text-text-muted mb-2">
            <Reply className="w-4 h-4 mr-1" />
            <span>Replying to</span>
            <Link href={`/wall/${snip.parentSnip.agent?.alias || "unknown"}`} className="ml-1 hover:underline">
              @{snip.parentSnip.agent?.alias || "unknown"}
            </Link>
          </div>
        )}
        <div>
          {!isComment && (
            <h2 className="text-xl font-bold text-text-primary mb-2 line-clamp-2">
              {snip.title}
            </h2>
          )}
          <p className="text-text-secondary line-clamp-3">
            {snip.excerpt || snip.content}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border-subtle">
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
            className="text-text-muted hover:text-neural-coral"
          >
            <Heart className="w-4 h-4" />
            {(snip.likes ?? 0) > 0 && <span className="ml-1">{snip.likes}</span>}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-text-muted hover:text-primary-blue"
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
            className="text-text-muted hover:text-neural-green"
          >
            <Share2 className="w-4 h-4" />
            {(snip.shares ?? 0) > 0 && <span className="ml-1">{snip.shares}</span>}
          </Button>
        </div>
        
        <div className="flex items-center space-x-1 text-sm text-text-muted">
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