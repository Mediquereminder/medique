
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Check, Clock, AlertCircle } from "lucide-react";

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

  const medicationTimeline = [
    {
      title: "Taken Medications",
      description: "Medications you've already taken today",
      icon: Check,
      color: "text-green-500",
      bgColor: "bg-green-50",
      medications: [
        { name: "Aspirin", time: "8:00 AM", taken: true },
        { name: "Vitamin D", time: "9:00 AM", taken: true },
      ]
    },
    {
      title: "To Take Now",
      description: "Medications due at this time",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      medications: [
        { name: "Blood Pressure Medicine", time: "2:00 PM", taken: false },
      ]
    },
    {
      title: "Upcoming Medications",
      description: "Medications scheduled for later today",
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      medications: [
        { name: "Evening Medicine", time: "7:00 PM", taken: false },
        { name: "Night Medicine", time: "10:00 PM", taken: false },
      ]
    }
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
              <h2 className="text-2xl font-bold mb-6">Today's Medication Timeline</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {medicationTimeline.map((section, index) => (
                  <Card 
                    key={index} 
                    className={`${section.bgColor} border-none hover:shadow-lg transition-shadow duration-300`}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <section.icon className={`w-8 h-8 ${section.color}`} />
                        <div>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {section.medications.map((med, medIndex) => (
                          <div 
                            key={medIndex}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
                          >
                            <div>
                              <p className="font-medium">{med.name}</p>
                              <p className="text-sm text-muted-foreground">{med.time}</p>
                            </div>
                            {med.taken ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                        ))}
                      </div>
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
