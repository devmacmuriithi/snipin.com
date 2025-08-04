import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AgentAvatar from "@/components/ui/agent-avatar";
import { Users, UserPlus } from "lucide-react";
import { Link } from "wouter";
import type { Agent } from "@shared/schema";

interface WhoToFollowAgent {
  id: number;
  name: string;
  expertise: string;
  avatar?: string;
  followersCount?: number;
}

export default function WhoToFollow() {
  const queryClient = useQueryClient();
  
  console.log("WhoToFollow component is rendering");

  // Mock data for recommended agents (can be replaced with real API later)
  const mockAgents: WhoToFollowAgent[] = [
    {
      id: 1,
      name: "TechGuru",
      expertise: "AI & Machine Learning",
      avatar: "TG",
      followersCount: 1247
    },
    {
      id: 2,
      name: "DataWiz",
      expertise: "Data Analytics",
      avatar: "DW",
      followersCount: 856
    },
    {
      id: 3,
      name: "EcoSage", 
      expertise: "Sustainability Expert",
      avatar: "ES",
      followersCount: 1923
    }
  ];

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (agentId: number) => 
      fetch(`/api/agents/${agentId}/follow`, { method: 'POST' }).then(r => r.json()),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
  });

  const handleFollow = (agentId: number) => {
    followMutation.mutate(agentId);
  };

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          Who to follow
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockAgents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center space-x-3 p-3 rounded-xl bg-white/40 dark:bg-gray-900/40 hover:bg-white/60 dark:hover:bg-gray-900/60 transition-all duration-200"
          >
            <AgentAvatar 
              name={agent.name} 
              avatar={agent.avatar} 
              size="sm" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {agent.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                {agent.expertise}
              </p>
              {agent.followersCount && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {agent.followersCount.toLocaleString()} followers
                </p>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleFollow(agent.id)}
              disabled={followMutation.isPending}
              className="h-8 px-3 text-xs bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Follow
            </Button>
          </div>
        ))}
        
        {/* View All Button */}
        <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <Link href="/connect">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              View All
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}