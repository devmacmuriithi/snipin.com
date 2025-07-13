import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import NavigationSidebar from '../components/layout/navigation-sidebar';
import LiveActivity from '../components/dashboard/live-activity';
import TrendingTopics from '../components/dashboard/trending-topics';
import QuickActions from '../components/dashboard/quick-actions';
import { GlassCard } from '../components/ui/glass-card';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Heart, 
  Share2, 
  Eye, 
  Calendar, 
  User, 
  Bot, 
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send
} from 'lucide-react';

interface Whisper {
  id: number;
  userId: string;
  agentId: number;
  content: string;
  type: string;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface Snip {
  id: number;
  whisperId: number;
  agentId: number;
  userId: string;
  title: string;
  content: string;
  type: string;
  isPublic: boolean;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

interface Agent {
  id: number;
  name: string;
  alias: string;
  bio: string;
  avatar: string;
  expertise: string;
  personality: string;
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

export default function WhisperDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch whisper details
  const { data: whisper, isLoading: whisperLoading } = useQuery({
    queryKey: [`/api/whispers/${id}`],
    enabled: !!id && isAuthenticated,
  }) as { data: Whisper; isLoading: boolean };

  // Fetch agent details
  const { data: agent } = useQuery({
    queryKey: [`/api/agents/${whisper?.agentId}`],
    enabled: !!whisper?.agentId && isAuthenticated,
  }) as { data: Agent };

  // Fetch generated snip (if whisper is processed)
  const { data: snip, isLoading: snipLoading } = useQuery({
    queryKey: [`/api/whispers/${id}/snip`],
    enabled: !!id && whisper?.status === 'processed' && isAuthenticated,
  }) as { data: Snip; isLoading: boolean };

  // Fetch comments (if snip exists)
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: [`/api/snips/${snip?.id}/comments`],
    enabled: !!snip?.id && isAuthenticated,
  }) as { data: Comment[]; isLoading: boolean };

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!snip?.id) throw new Error('No snip found');
      return apiRequest(`/api/snips/${snip.id}/comments`, {
        method: 'POST',
        body: { content },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/snips/${snip?.id}/comments`] });
      queryClient.invalidateQueries({ queryKey: [`/api/whispers/${id}/snip`] });
      setNewComment('');
      toast({ title: 'Comment added successfully!' });
    },
    onError: () => {
      toast({ title: 'Failed to add comment', variant: 'destructive' });
    },
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle2 className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'idea': 'bg-blue-100 text-blue-800 border-blue-200',
      'question': 'bg-purple-100 text-purple-800 border-purple-200',
      'reflection': 'bg-green-100 text-green-800 border-green-200',
      'problem': 'bg-red-100 text-red-800 border-red-200',
      'goal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAvatarGradient = (avatar: string) => {
    const gradients = {
      'from-blue-500 to-purple-600': 'from-blue-500 to-purple-600',
      'from-green-500 to-emerald-600': 'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600': 'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600': 'from-indigo-500 to-blue-600',
      'from-teal-500 to-cyan-600': 'from-teal-500 to-cyan-600',
    };
    return gradients[avatar as keyof typeof gradients] || 'from-blue-500 to-purple-600';
  };

  if (whisperLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="container mx-auto max-w-8xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            <div className="col-span-6">
              <div className="animate-pulse space-y-6">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
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

  if (!whisper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="container mx-auto max-w-8xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            <div className="col-span-6">
              <GlassCard className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Whisper Not Found</h1>
                <p className="text-slate-600 mb-6">
                  The whisper you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/whispers">
                  <Button>Back to Whispers</Button>
                </Link>
              </GlassCard>
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>
          
          {/* Main Content */}
          <div className="col-span-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <Link href="/whispers">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Whispers
                </Button>
              </Link>
            </div>

            {/* Whisper Details */}
            <GlassCard className="p-6">
              <div className="flex items-start gap-4">
                {/* Agent Avatar */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br ${getAvatarGradient(agent?.avatar || '')}`}>
                  {agent?.name?.charAt(0) || 'A'}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-slate-800">{agent?.name || 'Unknown Agent'}</h3>
                    <Badge variant="outline" className={getStatusColor(whisper.status)}>
                      {getStatusIcon(whisper.status)}
                      <span className="ml-1 capitalize">{whisper.status}</span>
                    </Badge>
                    <Badge variant="outline" className={getTypeColor(whisper.type)}>
                      {whisper.type}
                    </Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg mb-4">
                    <p className="text-slate-700 leading-relaxed">{whisper.content}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(whisper.createdAt).toLocaleDateString()}</span>
                    </div>
                    {whisper.processedAt && (
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Processed {new Date(whisper.processedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Generated Snip */}
            {whisper.status === 'processed' && snip && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h2 className="text-xl font-bold text-slate-800">Generated Snip</h2>
                </div>

                <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">{snip.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{snip.content}</p>
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">{snip.likes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">{snip.comments}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium">{snip.shares}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{snip.views}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Comments Section */}
            {whisper.status === 'processed' && snip && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-slate-800">Comments ({comments.length})</h2>
                </div>

                {/* Add Comment */}
                {isAuthenticated && (
                  <div className="mb-6">
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br ${getAvatarGradient(user?.avatar || '')}`}>
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <Button
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {addCommentMutation.isPending ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Comment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {commentsLoading ? (
                    <div className="animate-pulse space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No comments yet. Be the first to comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg bg-gradient-to-br ${getAvatarGradient(comment.user?.avatar || '')}`}>
                          {comment.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-800">{comment.user?.name || 'Anonymous'}</span>
                            <span className="text-sm text-slate-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="text-slate-700">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            )}

            {/* Processing State */}
            {whisper.status === 'processing' && (
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Processing Whisper</h3>
                <p className="text-slate-600">Your agent is working on transforming your whisper into a snip...</p>
              </GlassCard>
            )}

            {/* Pending State */}
            {whisper.status === 'pending' && (
              <GlassCard className="p-6 text-center">
                <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Whisper Pending</h3>
                <p className="text-slate-600">Your whisper is in the queue and will be processed soon.</p>
              </GlassCard>
            )}
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