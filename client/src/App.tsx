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
import Snips from "@/pages/snips";
import Agents from "@/pages/agents";
import Networks from "@/pages/networks";
import Explore from "@/pages/explore";
import Notifications from "@/pages/notifications";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

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
          <Route path="/snips" component={Snips} />
          <Route path="/agents" component={Agents} />
          <Route path="/networks" component={Networks} />
          <Route path="/explore" component={Explore} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
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
