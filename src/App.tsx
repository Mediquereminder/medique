
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from "react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStock from "./pages/AdminStock";
import AdminProfile from "./pages/AdminProfile";
import AdminPatients from "./pages/AdminPatients";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Stock from "./pages/Stock";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/ThemeProvider";
import LoadingOverlay from "./components/LoadingOverlay";

// Create auth context
interface AuthContextType {
  logout: () => void;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
  logout: () => {},
  isLoggingOut: false
});

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const App = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Remove current user from localStorage
      localStorage.removeItem("currentUser");
      setIsLoggingOut(false);
      // The Navigate component will handle the redirect
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthContext.Provider value={{ logout: handleLogout, isLoggingOut }}>
            <LoadingOverlay visible={isLoggingOut} message="Logging you out..." />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/history" element={<History />} />
                <Route path="/dashboard/profile" element={<Profile />} />
                <Route path="/dashboard/stock" element={<Stock />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-dashboard/stock" element={<AdminStock />} />
                <Route path="/admin-dashboard/patients" element={<AdminPatients />} />
                <Route path="/admin-dashboard/history" element={<History />} />
                <Route path="/admin-dashboard/profile" element={<AdminProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthContext.Provider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
