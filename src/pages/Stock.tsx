
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  LogOut,
  Menu,
  Plus,
  Trash2,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Medicine {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  expiryDate: string;
}

const Stock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'patient' | 'admin'>('patient');
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem("medicineStock");
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
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("medicineStock", JSON.stringify(medicines));
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
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role={userRole} />
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
              <div className="grid gap-6">
                {/* Role Indicator */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Medicine Stock</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Eye className="w-4 h-4" />
                    <span>{userRole === 'patient' ? 'View Only Mode' : 'Full Access Mode'}</span>
                  </div>
                </div>

                {/* Add New Medicine - Only visible to caretakers */}
                {userRole !== 'patient' && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Medicine</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="grid gap-2">
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
                          />
                        </div>
                        <div className="grid gap-2">
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
                          />
                        </div>
                        <div className="grid gap-2">
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
                          />
                        </div>
                        <div className="grid gap-2">
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
                          />
                        </div>
                      </div>
                      <Button className="mt-4" onClick={handleAddMedicine}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medicine
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Medicine List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Medicine Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {medicines.map((medicine) => {
                        const isLow = medicine.quantity <= medicine.threshold;
                        const isExpiringSoon =
                          new Date(medicine.expiryDate) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                        return (
                          <div
                            key={medicine.id}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
                          >
                            <div className="flex-1 grid gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{medicine.name}</span>
                                {isLow && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                                {isExpiringSoon && (
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Expires: {new Date(medicine.expiryDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {userRole !== 'patient' ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(medicine.id, -1)
                                      }
                                    >
                                      -
                                    </Button>
                                    <span className="w-12 text-center">
                                      {medicine.quantity}
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleUpdateQuantity(medicine.id, 1)
                                      }
                                    >
                                      +
                                    </Button>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDeleteMedicine(medicine.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-center">
                                  Quantity: {medicine.quantity}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {medicines.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No medicines in stock. {userRole !== 'patient' ? 'Add some medicines to get started.' : ''}
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
