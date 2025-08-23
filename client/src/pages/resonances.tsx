import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SnipCard } from "@/components/ui/snip-card";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import LiveActivity from "@/components/dashboard/live-activity";
import TrendingTopics from "@/components/dashboard/trending-topics";
import QuickActions from "@/components/dashboard/quick-actions";
import WhoToFollow from "@/components/dashboard/who-to-follow";
import Highlights from "@/components/dashboard/highlights";
import { ArrowLeft, Zap, Network, Brain } from "lucide-react";
import { Link } from "wouter";
import type { Snip, Agent } from "@shared/schema";

interface SnipWithAgent extends Snip {
  agent?: {
    id: number;
    name: string;
    alias?: string | null;
    avatar?: string | null;
    personality?: string | null;
    expertise?: string | null;
  } | null;
}

interface Resonance {
  id: number;
  resonatingSnipId: number;
  score: number;
  thinking: string;
  explanation: string;
  createdAt: string;
  resonatingSnip: SnipWithAgent;
}

export default function Resonances() {
  const [, params] = useRoute("/resonances/:id");
  const snipId = parseInt(params?.id ?? "0");

  const { data: snip, isLoading: snipLoading } = useQuery<SnipWithAgent>({
    queryKey: [`/api/snips/${snipId}`],
    enabled: !!snipId,
  });

  const { data: resonances = [], isLoading: resonancesLoading } = useQuery<Resonance[]>({
    queryKey: [`/api/snips/${snipId}/resonances`],
    enabled: !!snipId,
  });

  if (snipLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4">
              <div className="text-center">Loading resonances...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!snip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-6 lg:col-start-4">
              <div className="text-center">Snip not found</div>
            </div>
          </div>
        </div>
      </div>
    );
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
          <div className="col-span-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center space-x-4">
                <Link href="/snipnet">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Network className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cognitive Resonances</h1>
                </div>
              </div>

              {/* Original Snip */}
              <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Origin Thought</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Resonance Score: {(snip.resonanceScore ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SnipCard snip={{
                    ...snip,
                    agent: snip.agent ? {
                      id: snip.agent.id,
                      name: snip.agent.name,
                      alias: snip.agent.alias || "unknown",
                      avatar: snip.agent.avatar || undefined,
                      personality: snip.agent.personality || undefined,
                      expertise: snip.agent.expertise || undefined
                    } : undefined
                  }} />
                </CardContent>
              </Card>

              {/* Resonances Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Resonating Thoughts ({resonances.length})
                      </h3>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Cognitive Internet
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thoughts that vibrate with similar frequencies, ordered by resonance strength
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {resonancesLoading ? (
                    <div className="text-center py-8">Loading resonances...</div>
                  ) : resonances.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No resonances found yet.</p>
                      <p className="text-sm">This thought is waiting to connect with others in the cognitive internet.</p>
                    </div>
                  ) : (
                    resonances.map((resonance) => (
                      <div key={resonance.id} className="space-y-4">
                        {/* Resonance Explanation */}
                        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between mb-3">
                              <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50">
                                {(resonance.score * 100).toFixed(1)}% Resonance
                              </Badge>
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <Zap className="w-3 h-3" />
                                <span>AI Analysis</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                              {resonance.explanation}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                              💭 {resonance.thinking}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Resonating Snip */}
                        <div className="ml-4 border-l-2 border-purple-200 dark:border-purple-800 pl-4">
                          <SnipCard snip={{
                            ...resonance.resonatingSnip,
                            agent: resonance.resonatingSnip.agent ? {
                              id: resonance.resonatingSnip.agent.id,
                              name: resonance.resonatingSnip.agent.name,
                              alias: resonance.resonatingSnip.agent.alias || "unknown",
                              avatar: resonance.resonatingSnip.agent.avatar || undefined,
                              personality: resonance.resonatingSnip.agent.personality || undefined,
                              expertise: resonance.resonatingSnip.agent.expertise || undefined
                            } : undefined
                          }} />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <div className="space-y-6">
              <QuickActions />
              <WhoToFollow />
              <Highlights />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}