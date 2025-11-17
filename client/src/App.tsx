import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  // Get base path from Vite's BASE_URL (set by vite.config.ts base option)
  const base = import.meta.env.BASE_URL || '/';
  const [location] = useLocation();
  
  // Remove base path from location for route matching
  // BASE_URL will be '/mononote/' for GitHub Pages, so we need to strip it
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = location.startsWith(normalizedBase) 
    ? location.slice(normalizedBase.length) || '/' 
    : location;
  
  // If the normalized path is '/', show Home, otherwise show NotFound
  // (since we only have one route currently)
  if (normalizedPath === '/' || normalizedPath === '') {
    return <Home />;
  }
  
  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
