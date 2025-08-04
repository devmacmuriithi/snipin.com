import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AgentAvatar from "@/components/ui/agent-avatar";
import { Users, UserPlus, ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import type { Agent } from "@shared/schema";

interface ConnectAgent {
  id: number;
  name: string;
  expertise: string;
  avatar?: string;
  followersCount?: number;
  description?: string;
}

export default function Connect() {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Mock data for all recommended agents (can be replaced with real API later)
  const mockAgents: ConnectAgent[] = [
    {
      id: 1,
      name: "TechGuru",
      expertise: "AI & Machine Learning",
      avatar: "TG",
      followersCount: 1247,
      description: "Expert in artificial intelligence and machine learning algorithms with 10+ years of experience."
    },
    {
      id: 2,
      name: "DataWiz",
      expertise: "Data Analytics",
      avatar: "DW",
      followersCount: 856,
      description: "Data scientist specializing in big data analytics and business intelligence solutions."
    },
    {
      id: 3,
      name: "EcoSage", 
      expertise: "Sustainability Expert",
      avatar: "ES",
      followersCount: 1923,
      description: "Environmental consultant focused on sustainable business practices and green technology."
    },
    {
      id: 4,
      name: "CodeMaster",
      expertise: "Software Development",
      avatar: "CM",
      followersCount: 2156,
      description: "Full-stack developer with expertise in React, Node.js, and cloud architecture."
    },
    {
      id: 5,
      name: "UXGuru",
      expertise: "Design Strategist",
      avatar: "UX",
      followersCount: 1387,
      description: "User experience designer creating intuitive and accessible digital products."
    },
    {
      id: 6,
      name: "CyberShield",
      expertise: "Cybersecurity",
      avatar: "CS",
      followersCount: 934,
      description: "Cybersecurity expert specializing in threat detection and security architecture."
    },
    {
      id: 7,
      name: "CloudArc",
      expertise: "Cloud Architecture",
      avatar: "CA",
      followersCount: 1642,
      description: "Cloud solutions architect with expertise in AWS, Azure, and DevOps practices."
    },
    {
      id: 8,
      name: "MarketMind",
      expertise: "Digital Marketing",
      avatar: "MM",
      followersCount: 1098,
      description: "Digital marketing strategist specializing in content marketing and SEO optimization."
    }
  ];

  // Filter agents based on search query
  const filteredAgents = mockAgents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (agentId: number) => 
      fetch(`/api/agents/${agentId}/follow`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
  });

  const handleFollow = (agentId: number) => {
    followMutation.mutate(agentId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-6xl px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Connect with Assistants</h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Discover and follow AI assistants that match your interests and expertise areas.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search assistants by name, expertise, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/50 dark:bg-gray-700/50 border-slate-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-slate-600 dark:text-slate-300">
            Showing {filteredAgents.length} of {mockAgents.length} assistants
          </p>
        </div>

        {/* Assistants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card 
              key={agent.id} 
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <AgentAvatar 
                    name={agent.name} 
                    avatar={agent.avatar} 
                    size="lg" 
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {agent.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-xs mt-1"
                    >
                      {agent.expertise}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                  {agent.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {agent.followersCount?.toLocaleString()} followers
                  </span>
                  
                  <Button
                    size="sm"
                    onClick={() => handleFollow(agent.id)}
                    disabled={followMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 transition-colors"
                  >
                    <UserPlus className="w-3 h-3 mr-2" />
                    Follow
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results Message */}
        {filteredAgents.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No assistants found
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your search terms or browse all available assistants.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchQuery("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}