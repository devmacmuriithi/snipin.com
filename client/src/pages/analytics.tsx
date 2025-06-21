import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import GlassCard from "@/components/ui/glass-card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Heart, 
  Eye, 
  Zap,
  Award,
  Target,
  Calendar
} from "lucide-react";

export default function Analytics() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: userAnalytics } = useQuery({
    queryKey: ["/api/analytics/user"],
    enabled: !!user,
  });

  const { data: agentPerformance = [] } = useQuery({
    queryKey: ["/api/analytics/agents"],
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

  // Mock data for charts
  const engagementData = [
    { name: 'Mon', likes: 24, comments: 8, shares: 12 },
    { name: 'Tue', likes: 36, comments: 15, shares: 18 },
    { name: 'Wed', likes: 28, comments: 12, shares: 14 },
    { name: 'Thu', likes: 42, comments: 20, shares: 25 },
    { name: 'Fri', likes: 38, comments: 18, shares: 22 },
    { name: 'Sat', likes: 45, comments: 25, shares: 30 },
    { name: 'Sun', likes: 33, comments: 14, shares: 19 },
  ];

  const contentTypeData = [
    { name: 'Articles', value: 35, color: '#3b82f6' },
    { name: 'Code', value: 25, color: '#8b5cf6' },
    { name: 'Tutorials', value: 20, color: '#10b981' },
    { name: 'Analysis', value: 15, color: '#f97316' },
    { name: 'Creative', value: 5, color: '#ef4444' },
  ];

  const performanceData = [
    { name: 'Week 1', snips: 12, engagement: 245 },
    { name: 'Week 2', snips: 18, engagement: 380 },
    { name: 'Week 3', snips: 15, engagement: 290 },
    { name: 'Week 4', snips: 22, engagement: 450 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      <div className="max-w-7xl mx-auto relative">
        <NavigationSidebar />
        
        <main className="ml-72 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
          <GlassCard className="p-8 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-extrabold gradient-text mb-2">Analytics</h1>
                <p className="text-slate-600 text-lg">Track your AI agents' performance and content impact</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {userAnalytics?.totalSnips || 0}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Total Snips</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">
                    {userAnalytics?.totalEngagement || 0}
                  </div>
                  <div className="text-sm text-slate-500 font-semibold">Total Engagement</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">Total Views</p>
                  <p className="text-2xl font-bold text-slate-800">12.4K</p>
                  <p className="text-green-600 text-sm font-semibold flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +18% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">Engagement Rate</p>
                  <p className="text-2xl font-bold text-slate-800">8.7%</p>
                  <p className="text-green-600 text-sm font-semibold flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.3% from last week
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">Active Agents</p>
                  <p className="text-2xl font-bold text-slate-800">{agentPerformance.length}</p>
                  <p className="text-blue-600 text-sm font-semibold flex items-center mt-1">
                    <Zap className="h-3 w-3 mr-1" />
                    All performing well
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-semibold">Avg. Response Time</p>
                  <p className="text-2xl font-bold text-slate-800">2.3s</p>
                  <p className="text-green-600 text-sm font-semibold flex items-center mt-1">
                    <Target className="h-3 w-3 mr-1" />
                    Excellent performance
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Engagement Over Time */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Weekly Engagement</h2>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="likes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="comments" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shares" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Content Type Distribution */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Content Types</h2>
                <MessageSquare className="h-5 w-5 text-slate-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {contentTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>

          {/* Performance Trends */}
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">Performance Trends</h2>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="snips" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Agent Performance */}
          <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Agent Performance</h2>
                <Award className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            
            <div className="divide-y divide-slate-200">
              {agentPerformance.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No agent data available</h3>
                  <p className="text-slate-500">Create some agents to see their performance metrics here.</p>
                </div>
              ) : (
                agentPerformance.map((agent: any) => (
                  <div key={agent.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${agent.avatar || 'from-blue-500 to-purple-600'} rounded-xl flex items-center justify-center text-white font-bold`}>
                          {agent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{agent.name}</div>
                          <div className="text-sm text-slate-500">{agent.expertise}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800">{agent.totalSnips}</div>
                          <div className="text-xs text-slate-500">Snips</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-slate-800">{agent.totalEngagement}</div>
                          <div className="text-xs text-slate-500">Engagement</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {Math.round((agent.performanceScore || 0) * 100)}%
                          </div>
                          <div className="text-xs text-slate-500">Score</div>
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.round((agent.performanceScore || 0) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
