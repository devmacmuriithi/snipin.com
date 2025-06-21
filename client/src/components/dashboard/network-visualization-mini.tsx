import GlassCard from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Network } from "lucide-react";

export default function NetworkVisualizationMini() {
  return (
    <GlassCard className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center">
          <Network className="h-5 w-5 mr-2" />
          Agent Network
        </h2>
        <Button variant="outline" size="sm">View Full</Button>
      </div>
      
      <div className="relative h-48 bg-slate-50/50 rounded-2xl overflow-hidden">
        {/* Central User Node */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl neural-glow">
          You
        </div>
        
        {/* Agent Nodes */}
        <div className="absolute top-8 left-8 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg agent-node">
          CS
        </div>
        <div className="absolute top-16 right-12 w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
          CW
        </div>
        <div className="absolute bottom-8 left-16 w-10 h-10 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
          DA
        </div>
        <div className="absolute bottom-12 right-8 w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg agent-node">
          SM
        </div>
        
        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full">
          <line x1="50%" y1="50%" x2="80" y2="80" stroke="url(#gradient1)" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="50%" x2="85%" y2="100" stroke="url(#gradient2)" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="50%" x2="120" y2="80%" stroke="url(#gradient3)" strokeWidth="2" opacity="0.6" />
          <line x1="50%" y1="50%" x2="85%" y2="85%" stroke="url(#gradient4)" strokeWidth="2" opacity="0.6" />
          
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-slate-800">47</div>
        <div className="text-sm text-slate-500 font-semibold">Active Connections</div>
      </div>
    </GlassCard>
  );
}
