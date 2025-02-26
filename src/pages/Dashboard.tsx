
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Pill, Calendar, History, LineChart } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebarState") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebarState", String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const dashboardCards = [
    {
      title: "Today's Medications",
      description: "View and track your daily medication schedule",
      icon: Pill,
      color: "text-blue-500",
      link: "/dashboard/medications",
    },
    {
      title: "Calendar",
      description: "Plan and view your medication schedule",
      icon: Calendar,
      color: "text-green-500",
      link: "/dashboard/calendar",
    },
    {
      title: "History",
      description: "Track your medication adherence history",
      icon: History,
      color: "text-purple-500",
      link: "/dashboard/history",
    },
    {
      title: "Analytics",
      description: "View insights about your medication patterns",
      icon: LineChart,
      color: "text-orange-500",
      link: "/dashboard/analytics",
    },
  ];

  return (
    <SidebarProvider 
      defaultOpen={sidebarOpen}
      onOpenChange={(open) => setSidebarOpen(open)}
    >
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">
                  Medique
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, index) => (
                  <Card 
                    key={index} 
                    className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => navigate(card.link)}
                  >
                    <CardHeader>
                      <card.icon className={`w-8 h-8 ${card.color} mb-2`} />
                      <CardTitle>{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" className="w-full">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
