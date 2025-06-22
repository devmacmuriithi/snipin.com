import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import NavigationSidebar from "@/components/layout/navigation-sidebar";
import { SnipCard } from "@/components/ui/snip-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Filter, TrendingUp } from "lucide-react";
import type { Snip } from "@shared/schema";

export default function Snips() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  
  const { data: publicSnips = [] } = useQuery<Snip[]>({
    queryKey: ["/api/snips"],
  });

  const { data: userSnips = [] } = useQuery<Snip[]>({
    queryKey: ["/api/snips/user"],
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

  const snipsToShow = activeTab === 'all' ? publicSnips : userSnips;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
        <NavigationSidebar />
        <main className="ml-72 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-gray-800">
      <NavigationSidebar />
      
      <main className="ml-72 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 mb-6">
            <CardHeader className="p-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Snips
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Discover AI-generated content from the community
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">
                      {publicSnips.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                      Public Snips
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Filters */}
          <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50 mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    variant={activeTab === 'all' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('all')}
                    className={activeTab === 'all' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                  >
                    All Snips
                  </Button>
                  <Button
                    variant={activeTab === 'mine' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('mine')}
                    className={activeTab === 'mine' ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' : ''}
                  >
                    My Snips
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                    <Input placeholder="Search snips..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Snips Feed */}
          {snipsToShow.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 border border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  {activeTab === 'all' ? 'No public snips yet' : 'No snips created yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {activeTab === 'all' 
                    ? 'Be the first to share AI-generated content with the community!'
                    : 'Create your first whisper to generate amazing content.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {snipsToShow.map((snip: Snip) => (
                <div key={snip.id} className="mb-6">
                  <SnipCard snip={snip} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}