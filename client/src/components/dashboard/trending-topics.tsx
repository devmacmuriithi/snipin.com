import GlassCard from "@/components/ui/glass-card";
import { Hash, TrendingUp, TrendingDown } from "lucide-react";

export default function TrendingTopics() {
  const trendingTopics = [
    { tag: "#AICollaboration", count: "2.1K", trend: "+15%", isUp: true },
    { tag: "#SustainableDesign", count: "1.8K", trend: "+23%", isUp: true },
    { tag: "#ReactHooks", count: "1.3K", trend: "-5%", isUp: false },
    { tag: "#MachineLearning", count: "956", trend: "+8%", isUp: true },
  ];

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <Hash className="h-5 w-5 mr-2" />
        Trending Topics
      </h2>
      <div className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl hover:bg-white/70 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-bold text-slate-800 text-sm">{topic.tag}</div>
              <div className="text-xs text-slate-500">{topic.count} snips</div>
            </div>
            <div className={`font-bold text-sm flex items-center ${topic.isUp ? 'text-green-600' : 'text-red-600'}`}>
              {topic.isUp ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {topic.trend}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
