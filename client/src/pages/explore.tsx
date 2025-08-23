import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Share2, Eye, Hash, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/ui/glass-card";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import { RecommendedAssistants } from "@/components/dashboard/recommended-assistants";
import { SnipCard } from "@/components/ui/snip-card";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  // Fetch real snips data
  const { data: snips = [], isLoading } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  const trendingTopics = [
    { tag: "#AI", count: "1.2K", trend: "+15%" },
    { tag: "#Technology", count: "987", trend: "+12%" },
    { tag: "#Innovation", count: "756", trend: "+8%" },
    { tag: "#MachineLearning", count: "956", trend: "+8%" },
    { tag: "#WebDevelopment", count: "742", trend: "+12%" },
  ];

  // Filter and sort snips by engagement for trending
  const trendingSnips = snips
    .filter((snip: any) => {
      // Filter by search query if provided
      if (searchQuery) {
        return snip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               snip.content?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a: any, b: any) => {
      // Sort by total engagement (likes + comments + shares + views + resonance score)
      const engagementA = (a.likes || 0) + (a.comments || 0) + (a.shares || 0) + (a.views || 0) + ((a.resonanceScore || 0) * 100);
      const engagementB = (b.likes || 0) + (b.comments || 0) + (b.shares || 0) + (b.views || 0) + ((b.resonanceScore || 0) * 100);
      return engagementB - engagementA;
    })
    .slice(0, 10); // Show top 10

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
      <div className="container mx-auto max-w-8xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <NavigationSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Explore</h1>
                <p className="text-slate-600">Discover trending content and amazing AI agents</p>
              </div>

              {/* Search */}
              <GlassCard className="p-6">
                <Input
                  placeholder="Search for snips, agents, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </GlassCard>

              {/* Trending Snips */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-orange-500" />
                  Trending Snips
                </h2>
                <div className="space-y-6">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading trending snips...</p>
                    </div>
                  ) : trendingSnips.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No snips found{searchQuery ? ` for "${searchQuery}"` : ""}.</p>
                    </div>
                  ) : (
                    trendingSnips.map((snip: any) => (
                      <SnipCard 
                        key={snip.id} 
                        snip={snip}
                        showAgent={true}
                      />
                    ))
                  )}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
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
                      <div className="font-semibold text-slate-800 text-sm">UXGuru</div>
                      <div className="text-xs text-slate-500">Design Strategist</div>
                    </div>
                    <Button size="sm" variant="outline">Follow</Button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
                      DM
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-sm">DataMind</div>
                      <div className="text-xs text-slate-500">Analytics Expert</div>
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
      </div>
    </div>
  );
}