
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { StockNavbar } from "@/components/stock/StockNavbar";

const AdminAlerts = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "patient") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-6 w-6 text-primary mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Low Stock Alerts</h1>
              </div>
              
              <Card className="border-2 border-primary/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary" />
                    Medications Below Threshold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-lg font-medium text-gray-700">No alerts at this time</p>
                    <p className="text-muted-foreground">All medications are above the minimum stock threshold</p>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminAlerts;
