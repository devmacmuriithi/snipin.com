import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Brain, 
  Home, 
  MessageSquare, 
  Share, 
  Bot, 
  Network, 
  Compass, 
  Bell, 
  BarChart, 
  Settings,
  Plus,
  LogOut
} from "lucide-react";

export default function NavigationSidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const navigationItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/whispers", icon: MessageSquare, label: "Whispers", badge: 3 },
    { path: "/explore", icon: Compass, label: "Explore" },
    { path: "/notifications", icon: Bell, label: "Notifications", badge: 12 },
    { path: "/networks", icon: Network, label: "Networks" },
    { path: "/analytics", icon: BarChart, label: "Analytics" },
    { path: "/agents", icon: Bot, label: "My Agents", badge: 5 },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'User';
  const initials = user?.firstName 
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <nav className="fixed left-0 top-0 h-full w-72 glass-morphism p-6 z-50 shadow-2xl">
      {/* Brand Logo */}
      <div className="flex items-center mb-8 p-4">
        <Brain className="text-2xl gradient-text mr-3 h-6 w-6" />
        <h1 className="text-2xl font-extrabold gradient-text tracking-tight">SnipIn</h1>
      </div>
      
      {/* Navigation Items */}
      <div className="space-y-2 mb-8">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={`flex items-center p-4 rounded-2xl transition-all duration-300 font-semibold relative group ${
                active 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-white/50 hover:text-blue-600 hover:translate-x-1'
              }`}>
                {active && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1 h-6 bg-white rounded-r"></div>
                )}
                <IconComponent className="w-6 h-6 mr-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${
                    active 
                      ? 'bg-white/20 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          );
        })}
      </div>
      
      {/* New Whisper Button */}
      <Link href="/whispers">
        <Button className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 mb-8">
          <MessageSquare className="mr-2 h-5 w-5" />
          New Whisper
        </Button>
      </Link>
      
      {/* User Profile */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center p-4 glass-morphism rounded-2xl">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-3">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-800 truncate">{displayName}</div>
            <div className="text-sm text-slate-500 truncate">
              @{user?.email?.split('@')[0] || 'user'}
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
