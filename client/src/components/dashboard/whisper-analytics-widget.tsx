import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/glass-card";
import { TrendingUp } from "lucide-react";

export default function WhisperAnalyticsWidget() {
  const { user } = useAuth();

  const { data: whispers = [] } = useQuery({
    queryKey: ["/api/whispers"],
    enabled: !!user,
  });

  const { data: snips = [] } = useQuery({
    queryKey: ["/api/snips"],
    enabled: !!user,
  });

  // Calculate analytics from actual data
  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const whisperStats = {
    thisWeek: whispers.filter((w: any) => new Date(w.createdAt) >= thisWeek).length,
    successRate: whispers.length > 0 
      ? Math.round((whispers.filter((w: any) => w.status === 'processed').length / whispers.length) * 100)
      : 0,
    totalLikes: snips.reduce((sum: number, snip: any) => sum + (snip.likes || 0), 0),
    totalReplies: snips.reduce((sum: number, snip: any) => sum + (snip.comments || 0), 0),
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2" />
        Whisper Analytics
      </h3>

      <div className="grid grid-cols-2 gap-6">
        {/* This Week */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {whisperStats.thisWeek}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            This Week
          </div>
        </div>

        {/* Success Rate */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {whisperStats.successRate}%
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Success Rate
          </div>
        </div>

        {/* Total Likes */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatNumber(whisperStats.totalLikes)}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Total Likes
          </div>
        </div>

        {/* Replies */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {whisperStats.totalReplies}
          </div>
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
            Replies
          </div>
        </div>
      </div>
    </GlassCard>
  );
}