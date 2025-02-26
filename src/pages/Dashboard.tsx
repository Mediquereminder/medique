
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bell, Pill, Calendar, LogOut, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

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
          <nav className="glass-panel sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SidebarTrigger>
                <div className="text-2xl font-semibold text-primary">Medique</div>
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>

          {/* Main Content */}
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Upcoming Medications */}
              <div className="glass-panel p-6 rounded-lg space-y-4">
                <div className="flex items-center text-primary">
                  <Bell className="mr-2 h-5 w-5" />
                  <h2 className="text-lg font-semibold">Upcoming Medications</h2>
                </div>
                <p className="text-muted-foreground">No upcoming medications</p>
              </div>

              {/* Current Medications */}
              <div className="glass-panel p-6 rounded-lg space-y-4">
                <div className="flex items-center text-primary">
                  <Pill className="mr-2 h-5 w-5" />
                  <h2 className="text-lg font-semibold">Current Medications</h2>
                </div>
                <p className="text-muted-foreground">No medications added yet</p>
              </div>

              {/* Schedule */}
              <div className="glass-panel p-6 rounded-lg space-y-4">
                <div className="flex items-center text-primary">
                  <Calendar className="mr-2 h-5 w-5" />
                  <h2 className="text-lg font-semibold">Schedule</h2>
                </div>
                <p className="text-muted-foreground">No scheduled medications</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
