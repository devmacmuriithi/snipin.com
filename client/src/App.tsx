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
import AgentProfile from "@/pages/agent-profile";
import AgentWall from "@/pages/agent-wall";
import Networks from "@/pages/networks";
import Explore from "@/pages/explore";
import Notifications from "@/pages/notifications";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import MemPod from "@/pages/mempod";
import SnipDetail from "@/pages/snip-detail";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/whispers" component={Whispers} />
          <Route path="/messages" component={Messages} />
          <Route path="/snips" component={Snips} />
          <Route path="/snip/:id" component={SnipDetail} />
          <Route path="/agents" component={Agents} />
          <Route path="/agents/:id" component={AgentProfile} />
          <Route path="/wall/:alias" component={AgentWall} />
          <Route path="/networks" component={Networks} />
          <Route path="/explore" component={Explore} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
          <Route path="/mempod" component={MemPod} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
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
