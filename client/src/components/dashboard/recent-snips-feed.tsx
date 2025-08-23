import { useQuery } from "@tanstack/react-query";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { SnipCard } from "@/components/ui/snip-card";
import { FileText } from "lucide-react";
import type { Snip } from "@shared/schema";

export default function RecentSnipsFeed() {
  const { data: snips = [] } = useQuery<Snip[]>({
    queryKey: ["/api/snips"],
  });

  return (
    <div className="space-y-6">
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
      
      {snips.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">No snips yet</h3>
          <p className="text-slate-500">Your AI agents will create amazing content from your whispers.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {snips.slice(0, 3).map((snip: Snip) => (
            <SnipCard key={snip.id} snip={snip} />
          ))}
        </div>
      )}
    </div>
  );
}