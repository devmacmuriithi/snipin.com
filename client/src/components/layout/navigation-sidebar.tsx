import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  MessageSquare, 
  Mail, 
  Compass, 
  Bell,
  Bot,
  Brain,
  LogOut
} from "lucide-react";

function NavigationSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
    enabled: !!user,
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
  });

  const { data: whispers = [] } = useQuery({
    queryKey: ["/api/whispers"],
    enabled: !!user,
  });

  // Count unread notifications
  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;
  
  // Count pending/processing whispers
  const activeWhispers = Array.isArray(whispers) ? whispers.filter((w: any) => w.status === 'pending' || w.status === 'processing').length : 0;

  const navigationItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/whispers", icon: MessageSquare, label: "Whispers", badge: activeWhispers > 0 ? activeWhispers : undefined },
    { path: "/messages", icon: Mail, label: "Messages" },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifications > 0 ? unreadNotifications : undefined },
    { path: "/agents", icon: Bot, label: "My Agents", badge: Array.isArray(agents) && agents.length > 0 ? agents.length : undefined },
    { path: "/mempod", icon: Brain, label: "MemPod" },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return path !== "/" && location.startsWith(path);
  };

  const displayName = (user as any)?.firstName || (user as any)?.email?.split('@')[0] || 'User';
  const initials = (user as any)?.firstName 
    ? `${(user as any).firstName.charAt(0)}${(user as any).lastName?.charAt(0) || ''}`.toUpperCase()
    : (user as any)?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="glass-card-elevated rounded-3xl p-6 h-fit sticky top-6">
      {/* Brand Logo */}
      <div className="flex items-center mb-8 p-3">
        <Brain className="gradient-text mr-3 h-7 w-7" />
        <h1 className="text-2xl font-bold gradient-text tracking-tight">SnipIn</h1>
      </div>
      
      {/* Navigation Items */}
      <div className="space-y-1 mb-8">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center p-3 rounded-xl transition-all duration-200 font-medium relative group cursor-pointer ${
                active 
                  ? 'bg-gradient-to-r from-primary-blue to-neural-purple text-white shadow-lg' 
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}>
                <IconComponent className="w-5 h-5 mr-3" />
                <span className="text-sm">{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs font-medium px-2 py-1 rounded-full ${
                    active 
                      ? 'bg-white/20 text-white' 
                      : 'bg-neural-coral text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* New Whisper Button */}
      <Link href="/whispers">
        <Button 
          variant="gradient" 
          className="w-full mb-8 h-11 font-semibold"
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          New Whisper
        </Button>
      </Link>
      
      {/* User Profile */}
      <div className="mt-8">
        <div className="flex items-center p-3 bg-surface-secondary rounded-xl border border-border-subtle">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-blue to-neural-purple rounded-lg flex items-center justify-center text-white font-semibold text-sm mr-3">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-text-primary truncate text-sm">{displayName}</div>
            <div className="text-xs text-text-muted truncate">
              @{(user as any)?.email?.split('@')[0] || 'user'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/api/logout'}
            className="text-slate-400 hover:text-blue-600 transition-colors p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default NavigationSidebar;