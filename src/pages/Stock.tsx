
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Plus,
  Trash2,
  AlertTriangle,
  Eye,
  Pill,
  Calendar,
  Package,
  Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { StockNavbar } from "@/components/stock/StockNavbar";

interface Medicine {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  expiryDate: string;
  patientId?: string;
}

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'patient' | 'admin'>('patient');
  const [userId, setUserId] = useState<string>("");
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem("medicationStock");
    return saved ? JSON.parse(saved) : [];
  });
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    name: "",
    quantity: 0,
    threshold: 5,
    expiryDate: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    setUserRole(user.role || 'patient');
    setUserId(user.id || "");
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("medicationStock", JSON.stringify(medicines));
  }, [medicines]);

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.expiryDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const medicine: Medicine = {
      ...newMedicine,
      id: Date.now().toString(),
      patientId: userId
    };

    setMedicines((prev) => [...prev, medicine]);
    setNewMedicine({
      name: "",
      quantity: 0,
      threshold: 5,
      expiryDate: "",
    });

    toast({
      title: "Medicine Added",
      description: "The medicine has been added to your stock.",
    });
  };

  const handleDeleteMedicine = (id: string) => {
    setMedicines((prev) => prev.filter((medicine) => medicine.id !== id));
    toast({
      title: "Medicine Deleted",
      description: "The medicine has been removed from your stock.",
    });
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    if (userRole === 'patient') return;
    
    setMedicines((prev) =>
      prev.map((medicine) =>
        medicine.id === id
          ? { ...medicine, quantity: Math.max(0, medicine.quantity + change) }
          : medicine
      )
    );
    
    // Add to history
    const medicineUpdated = medicines.find(m => m.id === id);
    if (medicineUpdated) {
      const historyEntry = {
        id: Date.now().toString(),
        action: change > 0 ? "Added" : "Taken",
        date: new Date().toISOString().split('T')[0],
        medicine: medicineUpdated.name,
        quantity: change > 0 ? `+${change}` : `${change}`,
        patientId: userId
      };
      
      const savedHistory = localStorage.getItem("medicationHistory");
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      localStorage.setItem("medicationHistory", JSON.stringify([...history, historyEntry]));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Filter medicines for the current patient
  const userMedicines = medicines.filter(med => med.patientId === userId);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role={userRole} />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="grid gap-6">
                {/* Role Indicator */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">Medicine Stock</h2>
                      <p className="text-muted-foreground">Manage your medicine inventory</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary animate-fade-in">
                    <Eye className="w-4 h-4" />
                    <span>{userRole === 'patient' ? 'View Only Mode' : 'Full Access Mode'}</span>
                  </div>
                </div>

                {/* Add New Medicine - Only visible to caretakers */}
                {userRole !== 'patient' && (
                  <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5 text-primary" />
                        Add New Medicine
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Medicine Name</Label>
                          <Input
                            id="name"
                            value={newMedicine.name}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="border-2 hover:border-primary/50 transition-colors"
                            placeholder="Enter medicine name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Initial Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={newMedicine.quantity}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({
                                ...prev,
                                quantity: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="border-2 hover:border-primary/50 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="threshold">Alert Threshold</Label>
                          <Input
                            id="threshold"
                            type="number"
                            min="0"
                            value={newMedicine.threshold}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({
                                ...prev,
                                threshold: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="border-2 hover:border-primary/50 transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            type="date"
                            value={newMedicine.expiryDate}
                            onChange={(e) =>
                              setNewMedicine((prev) => ({
                                ...prev,
                                expiryDate: e.target.value,
                              }))
                            }
                            className="border-2 hover:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>
                      <Button 
                        className="mt-6 w-full md:w-auto transform hover:scale-105 transition-transform duration-200"
                        onClick={handleAddMedicine}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medicine
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Medicine List */}
                <Card className="border-2 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      Medicine Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {userMedicines.map((medicine) => {
                        const isLow = medicine.quantity <= medicine.threshold;
                        const isExpiringSoon =
                          new Date(medicine.expiryDate) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={medicine.id}
                            className={`
                              flex items-center justify-between p-6 
                              bg-white rounded-lg shadow-sm border-2
                              ${isLow ? 'border-red-200' : 'border-primary/20'}
                              transform hover:scale-[1.01] transition-all duration-200
                              hover:shadow-md
                            `}
                          >
                            <div className="flex-1 grid gap-2">
                              <div className="flex items-center gap-2">
                                <Pill className="w-5 h-5 text-primary" />
                                <span className="font-medium text-lg">{medicine.name}</span>
                                {isLow && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-500 rounded-full text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Low Stock
                                  </div>
                                )}
                                {isExpiringSoon && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-500 rounded-full text-sm">
                                    <AlertTriangle className="w-4 h-4" />
                                    Expiring Soon
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {userRole !== 'patient' ? (
                                <>
                                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(medicine.id, -1)
                                      }
                                      className="hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                      -
                                    </Button>
                                    <span className="w-12 text-center font-medium">
                                      {medicine.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(medicine.id, 1)
                                      }
                                      className="hover:bg-green-50 hover:text-green-500 transition-colors"
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => handleDeleteMedicine(medicine.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <span className="px-4 py-2 bg-gray-50 rounded-lg font-medium">
                                  Quantity: {medicine.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {userMedicines.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-4 text-primary/40" />
                          <p>No medicines in stock.</p>
                          {userRole !== 'patient' && (
                            <p className="text-sm">Add some medicines to get started.</p>
                          )}
                        </div>
                      )}
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

export default Stock;
