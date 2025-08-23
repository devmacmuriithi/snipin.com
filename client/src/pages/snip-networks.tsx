import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { 
  Brain, 
  Zap, 
  Users, 
  TrendingUp, 
  MapPin, 
  Sparkles,
  Network,
  Eye,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GlassCard from "@/components/ui/glass-card";
import NavigationSidebar from "@/components/layout/navigation-sidebar";

interface ResonanceCluster {
  id: string;
  theme: string;
  snipCount: number;
  totalResonance: number;
  avgResonance: number;
  snips: any[];
  topSnips: any[];
  keywords: string[];
}

interface ClusterNetworkStats {
  totalClusters: number;
  totalConnections: number;
  mostActiveCluster: string;
  strongestResonance: number;
}

export default function SnipNetworks() {
  const { user } = useAuth();
  const [selectedCluster, setSelectedCluster] = useState<ResonanceCluster | null>(null);

  // Fetch all snips and resonances to build clusters
  const { data: snips = [], isLoading: snipsLoading } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  const { data: allResonances = [], isLoading: resonancesLoading } = useQuery({
    queryKey: ["/api/resonances/all"],
    enabled: !!user,
  });

  // Build resonance clusters from the data
  const [clusters, setClusters] = useState<ResonanceCluster[]>([]);
  const [networkStats, setNetworkStats] = useState<ClusterNetworkStats>({
    totalClusters: 0,
    totalConnections: 0,
    mostActiveCluster: "",
    strongestResonance: 0
  });

  useEffect(() => {
    if (!Array.isArray(snips) || !Array.isArray(allResonances) || snips.length === 0 || allResonances.length === 0) return;

    // Simple clustering algorithm: group snips by resonance strength
    const snipGroups = new Map<string, any[]>();
    const snipResonanceMap = new Map<number, any[]>();

    // Build resonance map
    (allResonances as any[]).forEach((resonance: any) => {
      if (!snipResonanceMap.has(resonance.originSnipId)) {
        snipResonanceMap.set(resonance.originSnipId, []);
      }
      if (!snipResonanceMap.has(resonance.resonatingSnipId)) {
        snipResonanceMap.set(resonance.resonatingSnipId, []);
      }
      snipResonanceMap.get(resonance.originSnipId)?.push(resonance);
      snipResonanceMap.get(resonance.resonatingSnipId)?.push(resonance);
    });

    // Generate clusters based on shared themes and strong resonances
    const processedSnips = new Set<number>();
    const generatedClusters: ResonanceCluster[] = [];

    (snips as any[]).forEach((snip: any) => {
      if (processedSnips.has(snip.id)) return;

      const snipResonances = snipResonanceMap.get(snip.id) || [];
      const strongResonances = snipResonances.filter((r: any) => r.score > 0.7);

      if (strongResonances.length > 0) {
        // Find related snips through strong resonances
        const clusterSnips = [snip];
        const relatedSnipIds = new Set([snip.id]);

        strongResonances.forEach((resonance: any) => {
          const relatedId = resonance.originSnipId === snip.id 
            ? resonance.resonatingSnipId 
            : resonance.originSnipId;
          
          if (!relatedSnipIds.has(relatedId)) {
            const relatedSnip = (snips as any[]).find((s: any) => s.id === relatedId);
            if (relatedSnip) {
              clusterSnips.push(relatedSnip);
              relatedSnipIds.add(relatedId);
            }
          }
        });

        if (clusterSnips.length >= 2) {
          // Generate theme from snip titles/content
          const themes = clusterSnips.map((s: any) => s.title?.toLowerCase() || '');
          const commonWords = extractCommonThemes(themes);
          const theme = commonWords.length > 0 
            ? capitalizeTheme(commonWords[0]) 
            : `Cluster ${generatedClusters.length + 1}`;

          const totalResonance = strongResonances.reduce((sum: number, r: any) => sum + r.score, 0);
          const avgResonance = totalResonance / strongResonances.length;

          generatedClusters.push({
            id: `cluster-${generatedClusters.length + 1}`,
            theme,
            snipCount: clusterSnips.length,
            totalResonance,
            avgResonance,
            snips: clusterSnips,
            topSnips: clusterSnips.slice(0, 3),
            keywords: extractKeywords(clusterSnips)
          });

          clusterSnips.forEach((s: any) => processedSnips.add(s.id));
        }
      }
    });

    // Add individual high-resonance snips as single-snip clusters
    (snips as any[]).forEach((snip: any) => {
      if (!processedSnips.has(snip.id) && snip.resonanceScore > 0.6) {
        generatedClusters.push({
          id: `single-${snip.id}`,
          theme: snip.title?.substring(0, 30) + "..." || "Individual Thought",
          snipCount: 1,
          totalResonance: snip.resonanceScore,
          avgResonance: snip.resonanceScore,
          snips: [snip],
          topSnips: [snip],
          keywords: extractKeywords([snip])
        });
      }
    });

    // Sort clusters by strength
    generatedClusters.sort((a, b) => b.avgResonance - a.avgResonance);

    setClusters(generatedClusters);
    setNetworkStats({
      totalClusters: generatedClusters.length,
      totalConnections: allResonances.length,
      mostActiveCluster: generatedClusters[0]?.theme || "None",
      strongestResonance: Math.max(...(allResonances as any[]).map((r: any) => r.score), 0)
    });
  }, [snips, allResonances]);

  const extractCommonThemes = (themes: string[]): string[] => {
    const words = themes.join(' ').split(' ');
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      if (word.length > 3) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    return Array.from(wordCount.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);
  };

  const extractKeywords = (snips: any[]): string[] => {
    const allText = snips.map(s => `${s.title} ${s.content}`).join(' ').toLowerCase();
    const words = allText.split(/\s+/);
    const keywordMap = new Map<string, number>();

    words.forEach(word => {
      const cleaned = word.replace(/[^\w]/g, '');
      if (cleaned.length > 4 && !['that', 'this', 'with', 'from', 'they', 'have', 'been', 'will'].includes(cleaned)) {
        keywordMap.set(cleaned, (keywordMap.get(cleaned) || 0) + 1);
      }
    });

    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  const capitalizeTheme = (theme: string): string => {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  };

  const getClusterStrength = (cluster: ResonanceCluster): 'weak' | 'moderate' | 'strong' | 'cosmic' => {
    if (cluster.avgResonance > 0.85) return 'cosmic';
    if (cluster.avgResonance > 0.75) return 'strong';
    if (cluster.avgResonance > 0.65) return 'moderate';
    return 'weak';
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'cosmic': return 'from-purple-500 to-pink-500';
      case 'strong': return 'from-blue-500 to-indigo-500';
      case 'moderate': return 'from-green-500 to-teal-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const isLoading = snipsLoading || resonancesLoading;

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
                <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center justify-center">
                  <Network className="h-8 w-8 mr-3 text-purple-600" />
                  Thought Galaxies
                </h1>
                <p className="text-slate-600">Navigate resonance clusters in your cognitive universe</p>
              </div>

              {/* Network Stats */}
              <GlassCard className="p-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{networkStats.totalClusters}</div>
                    <div className="text-sm text-gray-600">Galaxies</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{networkStats.totalConnections}</div>
                    <div className="text-sm text-gray-600">Resonances</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{(networkStats.strongestResonance * 100).toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">Peak Sync</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{Array.isArray(snips) ? snips.length : 0}</div>
                    <div className="text-sm text-gray-600">Total Snips</div>
                  </div>
                </div>
              </GlassCard>

              {/* Cluster Explorer */}
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
                  Resonance Clusters
                </h2>

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Mapping your thought universe...</p>
                  </div>
                ) : clusters.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Clusters Yet</h3>
                    <p className="text-gray-500">Create more snips with strong resonances to see thought galaxies emerge!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clusters.map((cluster) => {
                      const strength = getClusterStrength(cluster);
                      const strengthColor = getStrengthColor(strength);
                      
                      return (
                        <div
                          key={cluster.id}
                          className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:bg-white/80 transition-all duration-300 cursor-pointer"
                          onClick={() => setSelectedCluster(cluster)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${strengthColor} rounded-xl flex items-center justify-center`}>
                                <Brain className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-lg">{cluster.theme}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {cluster.snipCount} snips
                                  </span>
                                  <span className="flex items-center">
                                    <Zap className="h-4 w-4 mr-1 text-purple-500" />
                                    {(cluster.avgResonance * 100).toFixed(0)}% resonance
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {strength}
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {cluster.keywords.map((keyword, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-sm text-gray-600">
                              <strong>Top snips:</strong> {cluster.topSnips.map(s => s.title).join(', ').substring(0, 120)}...
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Total resonance: {cluster.totalResonance.toFixed(2)}</span>
                            </div>
                            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                              Explore Galaxy <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="space-y-6">
              {/* Selected Cluster Details */}
              {selectedCluster && (
                <GlassCard className="p-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-500" />
                    Galaxy: {selectedCluster.theme}
                  </h3>
                  <div className="space-y-3">
                    {selectedCluster.snips.map((snip) => (
                      <Link key={snip.id} href={`/snip/${snip.id}`}>
                        <div className="p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors cursor-pointer">
                          <div className="font-medium text-sm text-slate-800 line-clamp-2">
                            {snip.title}
                          </div>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Zap className="h-3 w-3 mr-1 text-purple-500" />
                            {((snip.resonanceScore || 0) * 100).toFixed(0)}% resonance
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Navigation Hint */}
              <GlassCard className="p-6">
                <h3 className="font-bold text-slate-800 mb-3 flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-500" />
                  How to Navigate
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🌌 <strong>Galaxies</strong> are clusters of related thoughts</p>
                  <p>⚡ <strong>Resonance</strong> shows cognitive alignment</p>
                  <p>🔗 <strong>Click</strong> galaxies to explore snips within</p>
                  <p>🚀 <strong>Navigate</strong> between connected thoughts</p>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}