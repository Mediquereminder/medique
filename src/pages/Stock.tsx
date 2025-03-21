
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StockNavbar } from "@/components/stock/StockNavbar";

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
  patientId: string;
  expiryDate?: string;
}

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stock, setStock] = useState<MedicationStock[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
      return;
    }
    
    setCurrentUser(user);

    // Load stock from localStorage - filter for only this patient's medications
    const savedStock = localStorage.getItem("medicationStock");
    const allStock = savedStock ? JSON.parse(savedStock) : [];
    const patientStock = allStock.filter((item: MedicationStock) => item.patientId === user.userId);
    setStock(patientStock);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleTakeMedicine = (id: string) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity - 1),
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );

    // Update the global stock as well
    const savedStock = localStorage.getItem("medicationStock");
    const allStock = savedStock ? JSON.parse(savedStock) : [];
    const updatedAllStock = allStock.map((item: MedicationStock) => 
      item.id === id
        ? {
            ...item,
            quantity: Math.max(0, item.quantity - 1),
            lastUpdated: new Date().toISOString().split("T")[0],
          }
        : item
    );
    localStorage.setItem("medicationStock", JSON.stringify(updatedAllStock));

    const medicineTaken = stock.find(m => m.id === id);
    if (medicineTaken) {
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        medicine: medicineTaken.name,
        quantity: "1",
        patientId: currentUser.userId,
        patientName: currentUser.name,
        taken: true
      };
      
      const savedHistory = localStorage.getItem("medicationHistory");
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      localStorage.setItem("medicationHistory", JSON.stringify([...history, historyEntry]));
      
      toast({
        title: "Medicine Taken",
        description: `1 ${medicineTaken.name} pill has been taken.`,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Medication Stock</h1>
                <p className="text-muted-foreground">View your current medication inventory</p>
              </div>
              
              {stock.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">No medicines yet</h2>
                  <p className="text-muted-foreground mt-2 mb-6">
                    Your caretaker will add medicines to your inventory soon.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stock.map((medicine) => (
                    <Card key={medicine.id} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-primary">{medicine.name}</h3>
                        {medicine.quantity <= medicine.threshold && (
                          <div className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-medium text-muted-foreground">Current Stock</span>
                          <span className="text-2xl font-bold">{medicine.quantity}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Threshold</span>
                            <span>{medicine.threshold}</span>
                          </div>
                          {medicine.expiryDate && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Expires</span>
                              <span>{medicine.expiryDate}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last Updated</span>
                            <span>{medicine.lastUpdated}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                          <button 
                            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition flex items-center justify-center"
                            onClick={() => handleTakeMedicine(medicine.id)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Taken
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Stock;
