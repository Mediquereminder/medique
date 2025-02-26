import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Clock, CheckCircle, Timer } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";

// Sample data - in a real app, this would come from an API
const medications = [
  {
    id: 1,
    name: "Aspirin",
    time: "2 hours ago",
    dosage: "1 tablet",
    status: "taken",
  },
  {
    id: 2,
    name: "Vitamin C",
    time: "1 hour ago",
    dosage: "2 tablets",
    status: "taken",
  },
  {
    id: 3,
    name: "Paracetamol",
    time: "In 30 minutes",
    dosage: "2 tablets",
    status: "current",
  },
  {
    id: 4,
    name: "Vitamin D",
    time: "In 3 hours",
    dosage: "1 capsule",
    status: "upcoming",
  },
  {
    id: 5,
    name: "Iron Supplement",
    time: "In 5 hours",
    dosage: "1 tablet",
    status: "upcoming",
  },
  {
    id: 6,
    name: "Omega-3",
    time: "In 8 hours",
    dosage: "2 capsules",
    status: "upcoming",
  },
];

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

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-primary mb-8">Medication Timeline</h2>
                
                {/* 3D Timeline Row */}
                <div className="w-full overflow-x-auto perspective-[2000px] py-20 scrollbar-none">
                  <div className="flex gap-4 justify-center min-w-max">
                    {medications.slice(1, 4).map((med, index) => (
                      <Card
                        key={med.id}
                        className={`
                          transform-style-3d transition-all duration-500
                          w-72 shrink-0 p-6
                          ${index === 0 ? 'opacity-50 scale-75 -translate-x-1/4 translate-z-[-400px]' : ''}
                          ${index === 1 ? 'opacity-100 scale-100 translate-z-0 z-10' : ''}
                          ${index === 2 ? 'opacity-50 scale-75 translate-x-1/4 translate-z-[-400px]' : ''}
                          ${
                            med.status === "current"
                              ? "bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl border-2 border-primary/20"
                              : "bg-gradient-to-br from-gray-50 to-gray-100 shadow-xl"
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-4">
                          {med.status === "taken" && <CheckCircle className="w-12 h-12 text-green-500" />}
                          {med.status === "current" && <Timer className="w-16 h-16 text-primary animate-pulse" />}
                          {med.status === "upcoming" && <Clock className="w-12 h-12 text-blue-500" />}
                          
                          <h3 className={`${med.status === "current" ? "text-2xl font-bold" : "text-xl font-semibold"}`}>
                            {med.status === "taken" ? "Taken" : med.status === "current" ? "Next Dose" : "Upcoming"}
                          </h3>
                          
                          <div className="text-center">
                            <p className={`${med.status === "current" ? "text-xl" : "text-lg"} font-medium text-primary`}>
                              {med.name}
                            </p>
                            <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-gray-500`}>
                              {med.time}
                            </p>
                            <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-gray-500`}>
                              {med.dosage}
                            </p>
                          </div>
                          
                          {med.status === "current" && (
                            <Button className="mt-4 w-full">Mark as Taken</Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
