import GlassCard from "@/components/ui/glass-card";
import { Lightbulb, Target, RotateCcw } from "lucide-react";

export default function WhisperTipsWidget() {
  const tips = [
    {
      icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
      title: "Better Processing",
      description: "Include specific details and context for more engaging snips."
    },
    {
      icon: <Target className="h-4 w-4 text-purple-500" />,
      title: "Topic Focus",
      description: "Choose the right whisper type to help your agent understand intent."
    },
    {
      icon: <RotateCcw className="h-4 w-4 text-blue-500" />,
      title: "Iterate",
      description: "Use \"Re-whisper\" to improve unsuccessful transformations."
    }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-4">
        Whisper Tips
      </h3>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {tip.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                {tip.title}:
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {tip.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}