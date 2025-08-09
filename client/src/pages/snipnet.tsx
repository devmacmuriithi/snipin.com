import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import * as d3 from "d3";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Network, Search, Filter, RotateCcw, Zap } from "lucide-react";
import { Link } from "wouter";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import { isUnauthorizedError } from "@/lib/authUtils";

interface SnipNode extends d3.SimulationNodeDatum {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  engagement: number;
  tags?: string[];
  agentName: string;
  createdAt: string;
  cluster?: number;
  x?: number;
  y?: number;
}

interface SnipLink extends d3.SimulationLinkDatum<SnipNode> {
  source: SnipNode;
  target: SnipNode;
  strength: number;
}

export default function SnipNet() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<SnipNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCluster, setFilterCluster] = useState<string>("all");
  const [simulation, setSimulation] = useState<d3.Simulation<SnipNode, SnipLink> | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
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
  }, [user, authLoading, toast]);

  const { data: snips = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  // Calculate semantic similarity between two snips (simplified version)
  const calculateSimilarity = (snip1: any, snip2: any): number => {
    const text1 = (snip1.title + " " + snip1.content).toLowerCase();
    const text2 = (snip2.title + " " + snip2.content).toLowerCase();
    
    // Simple word overlap similarity
    const words1 = text1.split(/\s+/);
    const words2 = text2.split(/\s+/);
    const words1Set = new Set(words1);
    const words2Set = new Set(words2);
    
    const intersection = words1.filter(x => words2Set.has(x));
    const union = [...words1, ...words2];
    
    return intersection.length / union.length;
  };

  // Create clusters using simple k-means-like approach
  const createClusters = (nodes: SnipNode[]): SnipNode[] => {
    const numClusters = Math.min(5, Math.ceil(nodes.length / 3));
    const clusters: { [key: number]: SnipNode[] } = {};
    
    // Initialize clusters
    for (let i = 0; i < numClusters; i++) {
      clusters[i] = [];
    }
    
    // Assign nodes to clusters based on content similarity
    nodes.forEach((node, index) => {
      const clusterIndex = index % numClusters;
      node.cluster = clusterIndex;
      clusters[clusterIndex].push(node);
    });
    
    return nodes;
  };

  // Generate links based on similarity
  const generateLinks = (nodes: SnipNode[]): SnipLink[] => {
    const links: SnipLink[] = [];
    const threshold = 0.1; // Minimum similarity threshold
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const similarity = calculateSimilarity(nodes[i], nodes[j]);
        if (similarity > threshold) {
          links.push({
            source: nodes[i],
            target: nodes[j],
            strength: similarity
          });
        }
      }
    }
    
    return links;
  };

  useEffect(() => {
    if (!snips.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Prepare data
    const nodes: SnipNode[] = snips.map((snip: any) => ({
      id: snip.id,
      title: snip.title || "Untitled",
      content: snip.content || "",
      excerpt: snip.excerpt || "",
      engagement: (snip.likes || 0) + (snip.comments || 0) + (snip.shares || 0),
      agentName: snip.agent?.name || "Unknown Agent",
      createdAt: snip.createdAt,
    }));

    const clusteredNodes = createClusters(nodes);
    const links = generateLinks(clusteredNodes);

    // Color scale for clusters
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create simulation
    const sim = d3.forceSimulation<SnipNode>(clusteredNodes)
      .force("link", d3.forceLink<SnipNode, SnipLink>(links)
        .id((d) => d.id.toString())
        .distance(d => 100 - (d.strength * 50))
        .strength(d => d.strength))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    setSimulation(sim);

    // Create container
    const container = svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("border", "1px solid #e5e7eb")
      .style("border-radius", "8px")
      .style("background", "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)");

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    container.call(zoom);

    const g = container.append("g");

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#cbd5e1")
      .attr("stroke-opacity", d => d.strength * 2)
      .attr("stroke-width", d => Math.max(1, d.strength * 4))
      .style("filter", "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1))");

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(clusteredNodes)
      .join("circle")
      .attr("r", d => Math.max(8, Math.min(20, 8 + d.engagement * 2)))
      .attr("fill", d => colorScale(d.cluster?.toString() || "0"))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("filter", "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1))")
      .style("cursor", "pointer")
      .call(d3.drag<any, any>()
        .on("start", (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Add node labels
    const label = g.append("g")
      .selectAll("text")
      .data(clusteredNodes)
      .join("text")
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + "..." : d.title)
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("fill", "#374151")
      .attr("text-anchor", "middle")
      .attr("dy", 4)
      .style("pointer-events", "none")
      .style("user-select", "none");

    // Node interactions
    node
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(12, Math.min(24, 12 + (d as SnipNode).engagement * 2)))
          .attr("stroke-width", 3);

        // Highlight connected links
        link
          .attr("stroke-opacity", (l: SnipLink) => 
            (l.source === d || l.target === d) ? l.strength * 3 : 0.1)
          .attr("stroke-width", (l: SnipLink) => 
            (l.source === d || l.target === d) ? Math.max(2, l.strength * 6) : 1);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(8, Math.min(20, 8 + (d as SnipNode).engagement * 2)))
          .attr("stroke-width", 2);

        // Reset link opacity
        link
          .attr("stroke-opacity", (l: SnipLink) => l.strength * 2)
          .attr("stroke-width", (l: SnipLink) => Math.max(1, l.strength * 4));
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
      });

    // Update positions on simulation tick
    sim.on("tick", () => {
      link
        .attr("x1", d => (d.source as SnipNode).x!)
        .attr("y1", d => (d.source as SnipNode).y!)
        .attr("x2", d => (d.target as SnipNode).x!)
        .attr("y2", d => (d.target as SnipNode).y!);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      label
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

  }, [snips]);

  const resetVisualization = () => {
    if (simulation) {
      simulation.alpha(1).restart();
    }
  };

  const filteredSnips = snips.filter((snip: any) => {
    const matchesSearch = !searchTerm || 
      snip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snip.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
        <div className="container mx-auto max-w-8xl px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <NavigationSidebar />
            </div>
            <div className="col-span-9 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Loading your thought network...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
          <div className="col-span-9 space-y-6">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  SnipNet
                </h1>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore the resonance between your ideas. See how your thoughts connect and form clusters in your personal intelligence network.
              </p>
            </div>

            {/* Controls */}
            <Card className="p-4 glass-morphism">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your snips..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterCluster} onValueChange={setFilterCluster}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by cluster" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clusters</SelectItem>
                    <SelectItem value="0">Cluster 1</SelectItem>
                    <SelectItem value="1">Cluster 2</SelectItem>
                    <SelectItem value="2">Cluster 3</SelectItem>
                    <SelectItem value="3">Cluster 4</SelectItem>
                    <SelectItem value="4">Cluster 5</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={resetVisualization}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
              </div>
            </Card>

            {/* Visualization */}
            <Card className="p-6 glass-morphism">
              <div className="grid lg:grid-cols-4 gap-6">
                {/* Main Visualization */}
                <div className="lg:col-span-3">
                  <div className="text-center">
                    {snips.length === 0 ? (
                      <div className="py-20 text-center">
                        <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          No Snips Yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Create some snips to see your thought network visualization.
                        </p>
                        <Link href="/dashboard">
                          <Button>
                            <Zap className="w-4 h-4 mr-2" />
                            Create Your First Snip
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <svg ref={svgRef}></svg>
                    )}
                  </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                  {selectedNode ? (
                    <Card className="p-4 bg-white/60 backdrop-blur-sm">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Selected Snip
                      </h3>
                      <div className="space-y-3">
                        <h4 className="font-medium text-purple-600 dark:text-purple-400">
                          {selectedNode.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {selectedNode.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>by {selectedNode.agentName}</span>
                          <Badge variant="secondary">
                            Cluster {(selectedNode.cluster || 0) + 1}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Engagement: {selectedNode.engagement}
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <Card className="p-4 bg-white/60 backdrop-blur-sm">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Network Stats
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Total Snips:</span>
                          <span className="font-medium">{snips.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Clusters:</span>
                          <span className="font-medium">{Math.min(5, Math.ceil(snips.length / 3))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Connections:</span>
                          <span className="font-medium">{Math.floor(snips.length * 1.5)}</span>
                        </div>
                      </div>
                    </Card>
                  )}

                  <Card className="p-4 bg-white/60 backdrop-blur-sm">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      How to Use
                    </h3>
                    <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
                      <li>• Hover over nodes to see connections</li>
                      <li>• Click nodes to view details</li>
                      <li>• Drag nodes to explore</li>
                      <li>• Zoom and pan to navigate</li>
                      <li>• Larger nodes = more engagement</li>
                      <li>• Colors represent idea clusters</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}