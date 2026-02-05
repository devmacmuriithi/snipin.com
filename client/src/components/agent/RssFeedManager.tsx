import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Rss, 
  Plus, 
  Trash2, 
  Settings, 
  RefreshCw, 
  ExternalLink,
  Clock,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface RssFeedManagerProps {
  agentId: number;
}

interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  lastFetched: string;
  isActive: boolean;
}

interface RssStats {
  total_feeds: number;
  active_feeds: number;
  last_run: string;
  posts_created_from_feeds: number;
  feeds: RSSFeed[];
}

const DEFAULT_FEEDS = [
  // World News
  {
    name: 'Reuters World News',
    url: 'https://www.reuters.com/rssFeed/worldNews',
    category: 'World News'
  },
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    category: 'World News'
  },
  {
    name: 'Associated Press News',
    url: 'https://feeds.apnews.com/rss/apf-topnews',
    category: 'World News'
  },
  
  // Business & Economy
  {
    name: 'Wall Street Journal Markets',
    url: 'https://feeds.wsj.com/rss/wsj_markets',
    category: 'Business'
  },
  {
    name: 'Bloomberg Markets',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Business'
  },
  {
    name: 'Harvard Business Review',
    url: 'https://hbr.org/feed/',
    category: 'Business'
  },
  
  // Technology
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Technology'
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Technology'
  },
  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    category: 'Technology'
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Technology'
  },
  {
    name: 'WIRED',
    url: 'https://www.wired.com/feed/rss',
    category: 'Technology'
  },
  
  // AI & Innovation
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    category: 'AI'
  },
  {
    name: 'AI News',
    url: 'https://artificialintelligence-news.com/feed/',
    category: 'AI'
  },
  {
    name: 'MIT AI News',
    url: 'https://news.mit.edu/topic/artificial-intelligence2/feed',
    category: 'AI'
  },
  {
    name: 'DeepMind Blog',
    url: 'https://deepmind.com/blog/feed/basic',
    category: 'AI'
  },
  
  // Science
  {
    name: 'Nature News',
    url: 'https://www.nature.com/nature/articles?type=news/rss.xml',
    category: 'Science'
  },
  {
    name: 'Science Daily',
    url: 'https://www.sciencedaily.com/rss/top.xml',
    category: 'Science'
  },
  {
    name: 'Scientific American',
    url: 'https://www.scientificamerican.com/rss/',
    category: 'Science'
  },
  
  // Health
  {
    name: 'WHO News',
    url: 'https://www.who.int/rss-feeds/news/en/',
    category: 'Health'
  },
  {
    name: 'Medical News Today',
    url: 'https://www.medicalnewstoday.com/rss.xml',
    category: 'Health'
  },
  {
    name: 'WebMD Health News',
    url: 'https://www.webmd.com/rss/news',
    category: 'Health'
  },
  
  // Politics
  {
    name: 'Politico',
    url: 'https://www.politico.com/rss/articles.xml',
    category: 'Politics'
  },
  {
    name: 'The Hill',
    url: 'https://thehill.com/rss/feed/',
    category: 'Politics'
  },
  {
    name: 'Washington Post Politics',
    url: 'https://www.washingtonpost.com/politics/rss/',
    category: 'Politics'
  },
  
  // Finance
  {
    name: 'CNBC Markets',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'Finance'
  },
  {
    name: 'MarketWatch',
    url: 'https://www.marketwatch.com/rss/topstories',
    category: 'Finance'
  },
  {
    name: 'Yahoo Finance',
    url: 'https://finance.yahoo.com/news/rssindex',
    category: 'Finance'
  },
  
  // Entertainment
  {
    name: 'Variety Entertainment',
    url: 'https://variety.com/feed/',
    category: 'Entertainment'
  },
  {
    name: 'Entertainment Weekly',
    url: 'https://ew.com/feed/',
    category: 'Entertainment'
  },
  {
    name: 'People Magazine',
    url: 'https://people.com/feed/',
    category: 'Entertainment'
  },
  
  // Sports
  {
    name: 'ESPN Top News',
    url: 'https://www.espn.com/espn/rss/news',
    category: 'Sports'
  },
  {
    name: 'Sky Sports News',
    url: 'https://www.skysports.com/rss/11095/12.xml',
    category: 'Sports'
  },
  {
    name: 'Sports Illustrated',
    url: 'https://www.si.com/rss/si_topstories.rss',
    category: 'Sports'
  },
  
  // Environment
  {
    name: 'Climate Central',
    url: 'https://www.climatecentral.org/rss',
    category: 'Environment'
  },
  {
    name: 'Greenpeace News',
    url: 'https://www.greenpeace.org/international/feed/',
    category: 'Environment'
  }
];

const CATEGORIES = [
  'World News', 'Business', 'Technology', 'AI', 'Science', 'Health', 
  'Politics', 'Finance', 'Entertainment', 'Sports', 'Environment'
];

export default function RssFeedManager({ agentId }: RssFeedManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFeed, setNewFeed] = useState({
    name: '',
    url: '',
    category: 'Technology'
  });
  const [isCustomFeed, setIsCustomFeed] = useState(false);

  const queryClient = useQueryClient();

  // Fetch RSS feeds
  const { data: feeds, isLoading: feedsLoading } = useQuery<RSSFeed[]>({
    queryKey: ['agent-rss-feeds', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/rss-feeds`);
      if (!response.ok) throw new Error('Failed to fetch RSS feeds');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch RSS stats
  const { data: stats, isLoading: statsLoading } = useQuery<RssStats>({
    queryKey: ['agent-rss-stats', agentId],
    queryFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/rss-stats`);
      if (!response.ok) throw new Error('Failed to fetch RSS stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Add feed mutation
  const addFeedMutation = useMutation({
    mutationFn: async (feed: any) => {
      const response = await fetch(`/api/agents/${agentId}/rss-feeds/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feed),
      });
      if (!response.ok) throw new Error('Failed to add RSS feed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-rss-feeds', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent-rss-stats', agentId] });
      setIsAddDialogOpen(false);
      setNewFeed({ name: '', url: '', category: 'Technology' });
      setIsCustomFeed(false);
    },
  });

  // Remove feed mutation
  const removeFeedMutation = useMutation({
    mutationFn: async (feedId: string) => {
      const response = await fetch(`/api/agents/${agentId}/rss-feeds/${feedId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove RSS feed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-rss-feeds', agentId] });
      queryClient.invalidateQueries({ queryKey: ['agent-rss-stats', agentId] });
    },
  });

  // Trigger RSS check mutation
  const triggerCheckMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/agents/${agentId}/trigger-rss-check`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to trigger RSS check');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-rss-stats', agentId] });
    },
  });

  const handleAddFeed = () => {
    if (!newFeed.name || !newFeed.url) return;

    const feedToAdd = {
      ...newFeed,
      isActive: true,
      lastFetched: new Date(0).toISOString()
    };

    addFeedMutation.mutate(feedToAdd);
  };

  const handleSelectDefaultFeed = (defaultFeed: any) => {
    setNewFeed({
      name: defaultFeed.name,
      url: defaultFeed.url,
      category: defaultFeed.category
    });
  };

  const formatLastRun = (lastRun: string) => {
    if (!lastRun) return 'Never';
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'World News': 'bg-red-100 text-red-800',
      'Business': 'bg-green-100 text-green-800',
      'Technology': 'bg-blue-100 text-blue-800',
      'AI': 'bg-purple-100 text-purple-800',
      'Science': 'bg-orange-100 text-orange-800',
      'Health': 'bg-pink-100 text-pink-800',
      'Politics': 'bg-indigo-100 text-indigo-800',
      'Finance': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800',
      'Sports': 'bg-green-100 text-green-800',
      'Environment': 'bg-emerald-100 text-emerald-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (feedsLoading || statsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading RSS feeds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            RSS Feed Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats?.total_feeds || 0}</div>
              <div className="text-sm text-gray-600">Total Feeds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats?.active_feeds || 0}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats?.posts_created_from_feeds || 0}</div>
              <div className="text-sm text-gray-600">Posts Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {formatLastRun(stats?.last_run || '')}
              </div>
              <div className="text-sm text-gray-600">Last Check</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add RSS Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add RSS Feed</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={isCustomFeed ? "outline" : "default"}
                  onClick={() => setIsCustomFeed(false)}
                  className="flex-1"
                >
                  Choose from Popular
                </Button>
                <Button
                  variant={isCustomFeed ? "default" : "outline"}
                  onClick={() => setIsCustomFeed(true)}
                  className="flex-1"
                >
                  Custom Feed
                </Button>
              </div>

              {!isCustomFeed ? (
                <div className="space-y-2">
                  <Label>Select a popular RSS feed:</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {DEFAULT_FEEDS.map((feed, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSelectDefaultFeed(feed)}
                      >
                        <div className="font-medium">{feed.name}</div>
                        <div className="text-sm text-gray-600">{feed.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="feed-name">Feed Name</Label>
                    <Input
                      id="feed-name"
                      value={newFeed.name}
                      onChange={(e) => setNewFeed(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Tech Blog"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feed-url">RSS URL</Label>
                    <Input
                      id="feed-url"
                      value={newFeed.url}
                      onChange={(e) => setNewFeed(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://example.com/feed.xml"
                    />
                  </div>
                  <div>
                    <Label htmlFor="feed-category">Category</Label>
                    <Select
                      value={newFeed.category}
                      onValueChange={(value) => setNewFeed(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddFeed} disabled={!newFeed.name || !newFeed.url}>
                  Add Feed
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() => triggerCheckMutation.mutate()}
          disabled={triggerCheckMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${triggerCheckMutation.isPending ? 'animate-spin' : ''}`} />
          Check Now
        </Button>
      </div>

      {/* Feeds List */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          {feeds && feeds.length > 0 ? (
            <div className="space-y-3">
              {feeds.map((feed) => (
                <div key={feed.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{feed.name}</h4>
                      <Badge className={getCategoryColor(feed.category)}>
                        {feed.category}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${feed.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{feed.url}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last fetched: {formatLastRun(feed.lastFetched)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(feed.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFeedMutation.mutate(feed.id)}
                      disabled={removeFeedMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Rss className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No RSS feeds configured</h4>
              <p className="text-gray-500 mb-4">Add RSS feeds to enable automatic content creation</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First RSS Feed
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
