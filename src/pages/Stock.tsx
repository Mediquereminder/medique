import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Bell, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StockNavbar } from "@/components/stock/StockNavbar";

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
  expiryDate?: string;
}

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stock, setStock] = useState<MedicationStock[]>([]);
  const [isAddingMedicine, setIsAddingMedicine] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newMedicineQuantity, setNewMedicineQuantity] = useState("");
  const [newMedicineThreshold, setNewMedicineThreshold] = useState("");
  const [newMedicineExpiry, setNewMedicineExpiry] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }

    // Load stock from localStorage
    const savedStock = localStorage.getItem("medicationStock");
    const initialStock = savedStock ? JSON.parse(savedStock) : [];
    setStock(initialStock);
  }, [navigate]);

  useEffect(() => {
    // Save stock to localStorage whenever it changes
    localStorage.setItem("medicationStock", JSON.stringify(stock));
  }, [stock]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleAddMedicine = () => {
    if (!newMedicineName || !newMedicineQuantity || !newMedicineThreshold) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newItem: MedicationStock = {
      id: Date.now().toString(),
      name: newMedicineName,
      quantity: parseInt(newMedicineQuantity),
      threshold: parseInt(newMedicineThreshold),
      lastUpdated: new Date().toISOString().split("T")[0],
      expiryDate: newMedicineExpiry,
    };

    setStock((prev) => [...prev, newItem]);
    setNewMedicineName("");
    setNewMedicineQuantity("");
    setNewMedicineThreshold("");
    setNewMedicineExpiry("");
    setIsAddingMedicine(false);

    toast({
      title: "Medicine Added",
      description: "New medicine has been added to your inventory.",
    });
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

    const medicineTaken = stock.find(m => m.id === id);
    if (medicineTaken) {
      // Add to history
      const historyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        medicine: medicineTaken.name,
        quantity: "1",
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

  const handleUpdateStock = (id: string, quantityToAdd: number) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + quantityToAdd),
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );

    toast({
      title: "Stock Updated",
      description: "Medication stock has been successfully updated.",
    });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Medication Stock</h1>
                  <p className="text-muted-foreground">Track and manage your medication inventory</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button className="flex items-center gap-2" onClick={() => setIsAddingMedicine(true)}>
                    <Plus className="h-4 w-4" />
                    Add Medicine
                  </Button>
                </div>
              </div>
              
              {isAddingMedicine && (
                <Card className="mb-6 animate-in slide-in-from-top-10 duration-300">
                  <CardHeader>
                    <CardTitle>Add New Medicine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="medicine-name">Medicine Name</Label>
                          <Input 
                            id="medicine-name" 
                            placeholder="e.g., Aspirin"
                            value={newMedicineName}
                            onChange={(e) => setNewMedicineName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medicine-quantity">Initial Quantity</Label>
                          <Input 
                            id="medicine-quantity" 
                            type="number" 
                            min="1"
                            placeholder="e.g., 30"
                            value={newMedicineQuantity}
                            onChange={(e) => setNewMedicineQuantity(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="medicine-threshold">Low Stock Threshold</Label>
                          <Input 
                            id="medicine-threshold" 
                            type="number" 
                            min="1"
                            placeholder="e.g., 5"
                            value={newMedicineThreshold}
                            onChange={(e) => setNewMedicineThreshold(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="medicine-expiry">Expiry Date (Optional)</Label>
                          <Input 
                            id="medicine-expiry" 
                            type="date"
                            value={newMedicineExpiry}
                            onChange={(e) => setNewMedicineExpiry(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={() => setIsAddingMedicine(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddMedicine}>
                          Add Medicine
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {stock.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-700">No medicines yet</h2>
                  <p className="text-muted-foreground mt-2 mb-6">Add your first medicine to start tracking your stock</p>
                  <Button onClick={() => setIsAddingMedicine(true)}>
                    Add Your First Medicine
                  </Button>
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
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => handleTakeMedicine(medicine.id)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4 text-green-500" />
                            Take
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => handleUpdateStock(medicine.id, 1)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add
                          </Button>
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
