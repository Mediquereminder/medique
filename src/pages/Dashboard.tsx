
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Clock, CheckCircle, Timer } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          {/* Navigation */}
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">Medique</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          {/* Main Content */}
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex justify-center items-center gap-6 min-h-[calc(100vh-150px)]">
                {/* Previous Medication Card */}
                <Card className="w-72 p-6 transform transition-all duration-300 hover:scale-105 hover:-rotate-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
                  <div className="flex flex-col items-center gap-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <h3 className="text-xl font-semibold">Last Taken</h3>
                    <div className="text-center">
                      <p className="text-lg font-medium text-primary">Aspirin</p>
                      <p className="text-sm text-gray-500">2 hours ago</p>
                      <p className="text-sm text-gray-500">1 tablet</p>
                    </div>
                  </div>
                </Card>

                {/* Current Medication Card */}
                <Card className="w-80 p-8 transform transition-all duration-300 hover:scale-110 bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl border-2 border-primary/20">
                  <div className="flex flex-col items-center gap-4">
                    <Timer className="w-16 h-16 text-primary animate-pulse" />
                    <h3 className="text-2xl font-bold">Next Dose</h3>
                    <div className="text-center">
                      <p className="text-xl font-medium text-primary">Paracetamol</p>
                      <p className="text-lg text-gray-600">In 30 minutes</p>
                      <p className="text-lg text-gray-600">2 tablets</p>
                    </div>
                    <Button className="mt-4 w-full">Mark as Taken</Button>
                  </div>
                </Card>

                {/* Upcoming Medication Card */}
                <Card className="w-72 p-6 transform transition-all duration-300 hover:scale-105 hover:rotate-6 bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl">
                  <div className="flex flex-col items-center gap-4">
                    <Clock className="w-12 h-12 text-blue-500" />
                    <h3 className="text-xl font-semibold">Coming Up</h3>
                    <div className="text-center">
                      <p className="text-lg font-medium text-primary">Vitamin D</p>
                      <p className="text-sm text-gray-500">In 3 hours</p>
                      <p className="text-sm text-gray-500">1 capsule</p>
                    </div>
                  </div>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
