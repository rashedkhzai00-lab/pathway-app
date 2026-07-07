import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "./pages/Home";
import Focus from "./pages/Focus";
import Study from "./pages/Study";
import Plan from "./pages/Plan";
import Create from "./pages/Create";
import Hub from "./pages/Hub";
import Tips from "./pages/Tips";
import { useTheme } from "./hooks/useTheme";
import { FocusTimerProvider } from "./hooks/useFocusTimer";
import FloatingTimerBar from "./components/FloatingTimerBar";

const queryClient = new QueryClient();

const LAST_FEATURE_KEY = "pathway:lastUsedFeature";
const TRACKED_FEATURES = new Set(["/focus", "/study", "/plan", "/create"]);

function useTrackLastUsedFeature() {
  const [location] = useLocation();
  useEffect(() => {
    if (TRACKED_FEATURES.has(location)) {
      try {
        localStorage.setItem(LAST_FEATURE_KEY, location);
      } catch (e) {}
    }
  }, [location]);
}

function Router() {
  useTrackLastUsedFeature();
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/focus" component={Focus} />
      <Route path="/study" component={Study} />
      <Route path="/plan" component={Plan} />
      <Route path="/create" component={Create} />
      <Route path="/hub" component={Hub} />
      <Route path="/tips" component={Tips} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FocusTimerProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
            <FloatingTimerBar />
          </WouterRouter>
        </FocusTimerProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
