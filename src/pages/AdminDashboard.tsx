
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Users, AlertTriangle, LogOut, Menu } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [patientCount, setPatientCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
      return;
    }
    if (user.role === "patient") {
      navigate("/dashboard");
      return;
    }
    
    setCurrentUser(user);
    
    // Count connected patients - ensure the array exists and has unique values
    const connectedPatients = user.connectedPatients || [];
    // Use Set to ensure unique patient IDs only
    const uniquePatients = [...new Set(connectedPatients)];
    setPatientCount(uniquePatients.length);
    
    // Count medicines in stock for this caretaker's patients
    const allStock = JSON.parse(localStorage.getItem("medicationStock") || "[]");
    const relevantStock = allStock.filter((item: any) => 
      uniquePatients.includes(item.patientId)
    );
    setMedicineCount(relevantStock.length);
    
    // Count low stock alerts
    const lowStockItems = relevantStock.filter((item: any) => 
      item.quantity <= item.threshold
    );
    setAlertCount(lowStockItems.length);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12 flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/a1995604-78a6-42f0-a09f-3066fbff9ff7.png" 
                    alt="Medique Logo" 
                    className="h-8 w-auto"
                  />
                  Medique Admin
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
              <Button variant="ghost" size="icon" className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Medicine Stock Card */}
                <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Medicine Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-primary">{medicineCount}</div>
                      <p className="text-muted-foreground">Total medicines in stock</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient List Card */}
                <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Patients
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-primary">{patientCount}</div>
                      <p className="text-muted-foreground">Registered patients</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Low Stock Alerts Card */}
                <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-primary" />
                      Low Stock Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-4xl font-bold text-primary">{alertCount}</div>
                      <p className="text-muted-foreground">Items below threshold</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Improved Quick Actions Section */}
                <Card className="md:col-span-3 border-2 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        className="w-full transform hover:scale-105 transition-transform duration-200"
                        onClick={() => navigate("/admin-dashboard/stock")}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Manage Stock
                      </Button>
                      <Button 
                        className="w-full transform hover:scale-105 transition-transform duration-200"
                        variant="secondary"
                        onClick={() => navigate("/admin-dashboard/patients")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        View Patients
                      </Button>
                      <Button 
                        className="w-full transform hover:scale-105 transition-transform duration-200"
                        variant="outline"
                        onClick={() => navigate("/admin-dashboard/alerts")}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Check Alerts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
