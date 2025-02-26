
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Users, AlertTriangle, LogOut } from "lucide-react";

const AdminDashboard = () => {
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
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <nav className="glass-panel sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-semibold text-primary">MediBuddy Admin</div>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Medicine Stock */}
          <div className="glass-panel p-6 rounded-lg space-y-4">
            <div className="flex items-center text-primary">
              <Package className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Medicine Stock</h2>
            </div>
            <p className="text-muted-foreground">No medicines in stock</p>
          </div>

          {/* Patient List */}
          <div className="glass-panel p-6 rounded-lg space-y-4">
            <div className="flex items-center text-primary">
              <Users className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Patients</h2>
            </div>
            <p className="text-muted-foreground">No patients registered</p>
          </div>

          {/* Low Stock Alerts */}
          <div className="glass-panel p-6 rounded-lg space-y-4">
            <div className="flex items-center text-primary">
              <AlertTriangle className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-semibold">Low Stock Alerts</h2>
            </div>
            <p className="text-muted-foreground">No alerts</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
