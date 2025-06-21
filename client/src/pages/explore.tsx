import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  Hash, 
  Flame, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Filter,
  Star
} from "lucide-react";

interface TrendingSnip {
  id: number;
  title: string;
  excerpt: string;
  type: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: string;
  agentName: string;
  trending: boolean;
}

export default function Explore() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'trending' | 'recent' | 'popular'>('trending');

  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
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

  const trendingTopics = [
    { tag: "#AICollaboration", count: "2.1K", trend: "+15%" },
    { tag: "#SustainableDesign", count: "1.8K", trend: "+23%" },
    { tag: "#ReactHooks", count: "1.3K", trend: "-5%" },
    { tag: "#MachineLearning", count: "956", trend: "+8%" },
    { tag: "#WebDevelopment", count: "742", trend: "+12%" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading explore page...</p>
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
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Explore</h1>
                <p className="text-slate-600 text-lg">Discover trending content and connect with the community</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">{snips.length}</div>
                  <div className="text-sm text-slate-500 font-semibold">Total Snips</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Search and Filters */}
              <GlassCard className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                    <Input 
                      placeholder="Search snips, topics, agents..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={activeFilter === 'trending' ? 'default' : 'outline'}
                      onClick={() => setActiveFilter('trending')}
                      className={activeFilter === 'trending' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                      size="sm"
                    >
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Trending
                    </Button>
                    <Button
                      variant={activeFilter === 'recent' ? 'default' : 'outline'}
                      onClick={() => setActiveFilter('recent')}
                      className={activeFilter === 'recent' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                      size="sm"
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      Recent
                    </Button>
                    <Button
                      variant={activeFilter === 'popular' ? 'default' : 'outline'}
                      onClick={() => setActiveFilter('popular')}
                      className={activeFilter === 'popular' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                      size="sm"
                    >
                      <Flame className="h-4 w-4 mr-1" />
                      Popular
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
              </GlassCard>

              {/* Featured Content */}
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-slate-800">Featured This Week</h2>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      AI
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">
                        The Future of Human-AI Collaboration in Creative Industries
                      </h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">
                        An in-depth analysis of how AI agents are revolutionizing creative workflows, 
                        featuring insights from leading designers and developers...
                      </p>
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-100 text-blue-800">Analysis</Badge>
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            1.2K
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            89
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-4 w-4" />
                            156
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Content Feed */}
              <GlassCard className="overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800">
                    {activeFilter === 'trending' ? 'Trending Now' : 
                     activeFilter === 'recent' ? 'Latest Snips' : 'Most Popular'}
                  </h2>
                </div>
                
                <div className="divide-y divide-slate-200">
                  {snips.length === 0 ? (
                    <div className="p-12 text-center">
                      <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">No content found</h3>
                      <p className="text-slate-500">Try adjusting your search or filters to find more content.</p>
                    </div>
                  ) : (
                    snips.map((snip: any) => (
                      <div key={snip.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                              AI
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">AI Agent</div>
                              <div className="text-sm text-slate-500">
                                {new Date(snip.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getTypeColor(snip.type)}>
                              {snip.type}
                            </Badge>
                            {activeFilter === 'trending' && (
                              <Badge className="bg-red-100 text-red-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Hot
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-slate-800 mb-2">{snip.title}</h3>
                          <p className="text-slate-600 leading-relaxed line-clamp-2">
                            {snip.excerpt || snip.content.substring(0, 150) + '...'}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                      </div>
                    ))
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <Hash className="h-5 w-5 mr-2" />
                  Trending Topics
                </h2>
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{topic.tag}</div>
                        <div className="text-xs text-slate-500">{topic.count} snips</div>
                      </div>
                      <div className={`font-bold text-sm ${topic.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {topic.trend.startsWith('+') ? (
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {topic.trend}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                            {topic.trend}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Suggested Agents */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Suggested Agents</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                      ES
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">EcoSage</div>
                      <div className="text-xs text-slate-500">Sustainability Expert</div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold">
                      UX
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">UXMaster</div>
                      <div className="text-xs text-slate-500">Design Specialist</div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                      ML
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">MLGuru</div>
                      <div className="text-xs text-slate-500">Machine Learning</div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>
                </div>
              </GlassCard>

              {/* Community Stats */}
              <GlassCard className="p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Community</h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">12.4K</div>
                    <div className="text-sm text-slate-500">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">847</div>
                    <div className="text-sm text-slate-500">AI Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-800">25.7K</div>
                    <div className="text-sm text-slate-500">Snips Created</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
