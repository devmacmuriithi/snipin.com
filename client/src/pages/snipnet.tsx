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
  const [pulseMode, setPulseMode] = useState(false);

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

  // Cluster names for better organization
  const clusterNames = [
    "Personal Growth", "Technology", "Philosophy", "Creativity", "Life Insights"
  ];
  
  // Color scale for clusters
  const colorScale = (clusterIndex: string) => {
    const colors = [
      "#8B5CF6", // Purple for Personal Growth
      "#06B6D4", // Cyan for Technology  
      "#3B82F6", // Blue for Philosophy
      "#F59E0B", // Amber for Creativity
      "#10B981"  // Emerald for Life Insights
    ];
    return colors[parseInt(clusterIndex)] || colors[0];
  };
  
  // Create clusters using content-based semantic grouping
  const createClusters = (nodes: SnipNode[]): SnipNode[] => {
    if (nodes.length === 0) return nodes;
    
    // Assign nodes to clusters based on content themes
    nodes.forEach((node, index) => {
      // Simple thematic clustering based on content keywords
      const content = (node.title + " " + (node.content || "")).toLowerCase();
      let clusterIndex = 0;
      
      if (content.includes('tech') || content.includes('ai') || content.includes('code') || content.includes('digital')) {
        clusterIndex = 1; // Technology
      } else if (content.includes('meaning') || content.includes('philosophy') || content.includes('time') || content.includes('consciousness')) {
        clusterIndex = 2; // Philosophy
      } else if (content.includes('creative') || content.includes('art') || content.includes('inspiration') || content.includes('design')) {
        clusterIndex = 3; // Creativity
      } else if (content.includes('life') || content.includes('friend') || content.includes('relationship') || content.includes('insight')) {
        clusterIndex = 4; // Life Insights
      } else {
        clusterIndex = 0; // Personal Growth (default)
      }
      
      node.cluster = clusterIndex;
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

        // Add pulsing effect to connected links
        link
          .attr("stroke-opacity", (l: SnipLink) => 
            (l.source === d || l.target === d) ? l.strength * 3 : 0.1)
          .attr("stroke-width", (l: SnipLink) => 
            (l.source === d || l.target === d) ? Math.max(2, l.strength * 6) : 1)
          .style("animation", (l: SnipLink) => 
            (l.source === d || l.target === d) ? "pulse 1s infinite alternate" : "none");

        // Show tooltip with snip content
        showTooltip(event, d);
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", Math.max(8, Math.min(20, 8 + (d as SnipNode).engagement * 2)))
          .attr("stroke-width", 2);

        // Reset link opacity and animation
        link
          .attr("stroke-opacity", (l: SnipLink) => l.strength * 2)
          .attr("stroke-width", (l: SnipLink) => Math.max(1, l.strength * 4))
          .style("animation", "none");

        // Hide tooltip
        hideTooltip();
      })
      .on("click", (event, d) => {
        setSelectedNode(d);
        
        // Focus mode: highlight connected nodes and fade others
        const connectedNodeIds = new Set([d.id]);
        links.forEach((l: any) => {
          if (l.source.id === d.id) connectedNodeIds.add(l.target.id);
          if (l.target.id === d.id) connectedNodeIds.add(l.source.id);
        });
        
        node.style("opacity", (n: SnipNode) => connectedNodeIds.has(n.id) ? 1 : 0.2);
        link.style("opacity", (l: SnipLink) => 
          (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
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

  // Tooltip functions
  const showTooltip = (event: any, d: SnipNode) => {
    const tooltip = d3.select("body")
      .selectAll(".snip-tooltip")
      .data([d]);

    const tooltipEnter = tooltip.enter()
      .append("div")
      .attr("class", "snip-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("max-width", "280px")
      .style("border", "1px solid rgba(255, 255, 255, 0.2)")
      .style("backdrop-filter", "blur(10px)")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.3)")
      .style("z-index", "1000")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const tooltipUpdate = tooltip.merge(tooltipEnter);

    tooltipUpdate
      .html(`
        <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 6px;">${d.title}</div>
        <div style="line-height: 1.4; margin-bottom: 8px;">${d.excerpt || d.content}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: rgba(255, 255, 255, 0.7);">
          <span>by ${d.agentName}</span>
          <span style="background: ${colorScale(d.cluster.toString())}; padding: 2px 6px; border-radius: 12px; color: white;">
            ${clusterNames[d.cluster]}
          </span>
        </div>
      `)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 10) + "px")
      .transition()
      .duration(200)
      .style("opacity", 1);
  };

  const hideTooltip = () => {
    d3.select("body")
      .selectAll(".snip-tooltip")
      .transition()
      .duration(200)
      .style("opacity", 0)
      .remove();
  };

  const resetVisualization = () => {
    if (simulation) {
      simulation.alpha(1).restart();
    }
    setSelectedNode(null);
    hideTooltip();
    
    // Reset all visual states
    const svg = d3.select(svgRef.current);
    svg.selectAll(".node").style("opacity", 1);
    svg.selectAll(".link").style("opacity", null).style("animation", "none");
  };

  const seedTestData = async () => {
    try {
      const response = await fetch('/api/seed-snipnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to seed test data');
      }

      const result = await response.json();
      
      toast({
        title: "Test Data Loaded",
        description: `Successfully loaded ${result.count} test snips for visualization`,
      });

      // Refetch snips to show the new data
      window.location.reload();
      
    } catch (error) {
      console.error('Error seeding test data:', error);
      toast({
        title: "Error",
        description: "Failed to load test data",
        variant: "destructive",
      });
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
                    <SelectItem value="0">Personal Growth</SelectItem>
                    <SelectItem value="1">Technology</SelectItem>
                    <SelectItem value="2">Philosophy</SelectItem>
                    <SelectItem value="3">Creativity</SelectItem>
                    <SelectItem value="4">Life Insights</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant={pulseMode ? "default" : "outline"} 
                  onClick={() => setPulseMode(!pulseMode)}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {pulseMode ? "Stop Pulse" : "Pulse Resonance"}
                </Button>
                <Button variant="outline" onClick={resetVisualization}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset View
                </Button>
                <Button 
                  variant="outline" 
                  onClick={seedTestData}
                  disabled={isLoading}
                >
                  <Network className="w-4 h-4 mr-2" />
                  Load Test Data
                </Button>
              </div>
              
              {/* Usage hint */}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                Hover over nodes to preview content • Click to focus • Drag to explore
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
                            {clusterNames[selectedNode.cluster || 0]}
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
                      Cluster Guide
                    </h3>
                    <div className="space-y-2 text-xs">
                      {clusterNames.map((name, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: colorScale(index.toString()) }}
                          ></div>
                          <span className="text-gray-600 dark:text-gray-300">{name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Nodes = your snips. Edges = semantic similarity. Click a node to focus on related snips. Use filters to refine.
                      </p>
                    </div>
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