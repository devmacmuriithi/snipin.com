import { useAuth } from "@/hooks/useAuth";
import GlassCard from "@/components/ui/glass-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Zap, Users, TrendingUp } from "lucide-react";

function WelcomeHeader() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    return email || "User";
  };

  return (
    <GlassCard className="p-8 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profileImageUrl || ""} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
              {getInitials(user.firstName, user.lastName, user.email)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Welcome back, {getDisplayName(user.firstName, user.lastName, user.email)}!
            </h1>
            <p className="text-gray-600">
              Ready to create and explore with your AI agents?
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">3 Active</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">12 Agents</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">85% Growth</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 rounded-lg px-3 py-2">
              <Bell className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">2 New</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default WelcomeHeader;