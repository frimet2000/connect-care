import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import TherapistProfile from "./pages/TherapistProfile";
import TherapistDashboard from "./pages/TherapistDashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FeedbackButton from "./components/FeedbackButton";

const queryClient = new QueryClient();

// Visit Tracker Component
const VisitTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Only track main entry or distinct page views if needed. 
    // For "leads entered the system", we can count unique sessions or just page loads.
    // Let's use a simple counter in localStorage.

    // Check if we already counted this session
    const sessionVisited = sessionStorage.getItem("visit_recorded");

    if (!sessionVisited) {
      const currentVisits = parseInt(localStorage.getItem("total_system_visits") || "0");
      localStorage.setItem("total_system_visits", (currentVisits + 1).toString());
      sessionStorage.setItem("visit_recorded", "true");
      console.log("New visit recorded. Total:", currentVisits + 1);
    }
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VisitTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/therapist/:id" element={<TherapistProfile />} />
            <Route path="/dashboard" element={<TherapistDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
