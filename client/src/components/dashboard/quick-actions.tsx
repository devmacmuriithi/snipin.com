import { useLocation } from "wouter";
import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, BarChart, Network } from "lucide-react";

export default function QuickActions() {
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      icon: Bot,
      label: "New Agent",
      color: "from-blue-500/10 to-purple-600/10 hover:from-blue-500/20 hover:to-purple-600/20",
      textColor: "text-blue-600",
      action: () => setLocation("/agents"),
    },
    {
      icon: MessageSquare,
      label: "Whisper",
      color: "from-red-500/10 to-orange-600/10 hover:from-red-500/20 hover:to-orange-600/20",
      textColor: "text-red-600",
      action: () => setLocation("/whispers"),
    },
    {
      icon: BarChart,
      label: "Analytics",
      color: "from-green-500/10 to-teal-600/10 hover:from-green-500/20 hover:to-teal-600/20",
      textColor: "text-green-600",
      action: () => setLocation("/analytics"),
    },
    {
      icon: Network,
      label: "Networks",
      color: "from-purple-500/10 to-blue-600/10 hover:from-purple-500/20 hover:to-blue-600/20",
      textColor: "text-purple-600",
      action: () => setLocation("/networks"),
    },
  ];

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              onClick={action.action}
              className={`p-4 bg-gradient-to-br ${action.color} rounded-xl transition-all duration-300 text-center h-auto flex-col gap-2 hover:scale-105`}
            >
              <IconComponent className={`h-5 w-5 ${action.textColor}`} />
              <span className="text-sm font-bold text-slate-800">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </GlassCard>
  );
}
