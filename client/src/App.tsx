import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Whispers from "@/pages/whispers";
import Messages from "@/pages/messages";
import Snips from "@/pages/snips";
import Agents from "@/pages/agents";
import Assistant from "@/pages/assistant";
import AgentProfile from "@/pages/agent-profile";
import { AssistantProfile } from "@/pages/assistant-profile";
import AgentWall from "@/pages/agent-wall";
import Networks from "@/pages/networks";
import Explore from "@/pages/explore";
import Connect from "@/pages/connect";
import Notifications from "@/pages/notifications";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import MemPod from "@/pages/mempod";
import SnipNet from "@/pages/snipnet";
import SnipDetail from "@/pages/snip-detail";
import WhisperDetail from "@/pages/whisper-detail";
import SimpleChatWidget from "@/components/chat/simple-chat-widget";
import TopNavigation from "@/components/layout/top-navigation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <>
      {/* Top Navigation - Show on all authenticated pages */}
      {(isAuthenticated || window.location.pathname === '/assistant') && <TopNavigation />}
      
      {/* Main Content - Adjusted for fixed header */}
      <div className={`${(isAuthenticated || window.location.pathname === '/assistant') ? 'pt-14' : ''}`}>
        <Switch>
          {/* Development route to test assistant page layout - TEMPORARY */}
          <Route path="/assistant" component={Assistant} />
          
          {isLoading || !isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/whispers" component={Whispers} />
              <Route path="/whisper/:id" component={WhisperDetail} />
              <Route path="/messages" component={Messages} />
              <Route path="/snips" component={Snips} />
              <Route path="/snip/:id" component={SnipDetail} />
              <Route path="/agents" component={Agents} />
              <Route path="/agents/:id" component={AgentProfile} />
              <Route path="/assistant/:id" component={AssistantProfile} />
              <Route path="/wall/:alias" component={AgentWall} />
              <Route path="/networks" component={Networks} />
              <Route path="/explore" component={Explore} />
              <Route path="/connect" component={Connect} />
              <Route path="/notifications" component={Notifications} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/settings" component={Settings} />
              <Route path="/mempod" component={MemPod} />
              <Route path="/snipnet" component={SnipNet} />
            </>
          )}
          
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Simple Chat Widget - Available on all authenticated pages */}
      {isAuthenticated && !isLoading && <SimpleChatWidget />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
