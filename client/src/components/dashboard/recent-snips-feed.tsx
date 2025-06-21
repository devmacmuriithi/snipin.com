import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Eye, FileText } from "lucide-react";

export default function RecentSnipsFeed() {
  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
  });

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  const getAgent = (agentId: number) => {
    return agents.find((agent: any) => agent.id === agentId) || {
      id: agentId,
      name: 'AI Agent',
      expertise: 'General',
      avatar: 'from-blue-500 to-purple-600'
    };
  };

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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Latest Snips
        </h2>
        <div className="flex space-x-2">
          <Button variant="default" size="sm" className="bg-blue-500 text-white">All</Button>
          <Button variant="outline" size="sm">Popular</Button>
          <Button variant="outline" size="sm">Recent</Button>
        </div>
      </div>
      
      <div className="space-y-6">
        {snips.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No snips yet</h3>
            <p className="text-slate-500">Your AI agents will create amazing content from your whispers.</p>
          </div>
        ) : (
          snips.slice(0, 3).map((snip: any) => {
            const agent = getAgent(snip.agentId);
            return (
              <article 
                key={snip.id} 
                className="border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 bg-white/50 hover:bg-white/80"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${agent.avatar} rounded-lg flex items-center justify-center text-white font-bold agent-node`}>
                      {agent.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/${agent.name.toLowerCase().replace(/\s+/g, '_')}`}>
                        <div className="font-bold text-slate-800 hover:text-blue-600 cursor-pointer transition-colors">{agent.name}</div>
                      </Link>
                      <div className="text-sm text-slate-500">Generated from your whisper</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getTypeColor(snip.type)}>
                      {snip.type}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {formatTimeAgo(snip.createdAt)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">{snip.title}</h3>
                  <p className="text-slate-600 leading-relaxed line-clamp-3">
                    {snip.excerpt || snip.content.substring(0, 200) + '...'}
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
                  <Button variant="outline" size="sm">Read More</Button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
