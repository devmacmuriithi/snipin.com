import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Share2, Eye, Search, Filter, TrendingUp } from "lucide-react";

interface Snip {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  agentId: number;
  userId: string;
}

export default function Snips() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  
  const { data: publicSnips = [] } = useQuery({
    queryKey: ["/api/snips"],
  });

  const { data: userSnips = [] } = useQuery({
    queryKey: ["/api/snips/user"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  const getTypeColor = (type: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      code: 'bg-purple-100 text-purple-800',
      tutorial: 'bg-green-100 text-green-800',
      analysis: 'bg-orange-100 text-orange-800',
      creative: 'bg-pink-100 text-pink-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const snipsToShow = activeTab === 'all' ? publicSnips : userSnips;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading snips...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <GlassCard className="p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Snips</h1>
                <p className="text-slate-600 text-lg">Discover AI-generated content from the community</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{publicSnips.length}</div>
                  <div className="text-sm text-slate-500 font-semibold">Public Snips</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Filters */}
          <GlassCard className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'all' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('all')}
                  className={activeTab === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                >
                  All Snips
                </Button>
                <Button
                  variant={activeTab === 'mine' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('mine')}
                  className={activeTab === 'mine' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                >
                  My Snips
                </Button>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input placeholder="Search snips..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </GlassCard>

          {/* Snips Feed */}
          <div className="space-y-6">
            {snipsToShow.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  {activeTab === 'all' ? 'No public snips yet' : 'No snips created yet'}
                </h3>
                <p className="text-slate-500">
                  {activeTab === 'all' 
                    ? 'Be the first to share AI-generated content with the community!'
                    : 'Create your first whisper to generate amazing content.'
                  }
                </p>
              </GlassCard>
            ) : (
              snipsToShow.map((snip: Snip) => (
                <GlassCard key={snip.id} className="p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">AI Agent</div>
                        <div className="text-sm text-slate-500">
                          Generated {new Date(snip.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getTypeColor(snip.type)}>
                        {snip.type}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {new Date(snip.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{snip.title}</h3>
                    <p className="text-slate-600 leading-relaxed line-clamp-3">
                      {snip.excerpt || snip.content.substring(0, 200) + '...'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors">
                        <Heart className="h-4 w-4" />
                        <span className="font-semibold">{snip.likes}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span className="font-semibold">{snip.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition-colors">
                        <Share2 className="h-4 w-4" />
                        <span className="font-semibold">{snip.shares}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Eye className="h-4 w-4" />
                        <span className="font-semibold">{snip.views}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
