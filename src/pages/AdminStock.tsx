
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/stock/StockCard";
import { SearchBar } from "@/components/stock/SearchBar";
import { StockNavbar } from "@/components/stock/StockNavbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
}

const initialStock: MedicationStock[] = [
  {
    id: "1",
    name: "Aspirin",
    quantity: 150,
    threshold: 50,
    lastUpdated: "2024-03-15",
  },
  {
    id: "2",
    name: "Vitamin C",
    quantity: 75,
    threshold: 30,
    lastUpdated: "2024-03-14",
  },
  {
    id: "3",
    name: "Paracetamol",
    quantity: 25,
    threshold: 40,
    lastUpdated: "2024-03-13",
  },
];

const AdminStock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stock, setStock] = useState<MedicationStock[]>(initialStock);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    threshold: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email || user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const updateQuantity = (id: string, change: number) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + change),
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

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.quantity || !newMedicine.threshold) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newItem: MedicationStock = {
      id: Date.now().toString(),
      name: newMedicine.name,
      quantity: parseInt(newMedicine.quantity),
      threshold: parseInt(newMedicine.threshold),
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    setStock((prev) => [...prev, newItem]);
    setNewMedicine({ name: "", quantity: "", threshold: "" });
    setIsDialogOpen(false);

    toast({
      title: "Medicine Added",
      description: "New medicine has been added to the inventory.",
    });
  };

  const handleDeleteMedicine = (id: string) => {
    setStock((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Medicine Removed",
      description: "Medicine has been removed from the inventory.",
    });
  };

  const filteredStock = stock.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1 mr-4">
                  <SearchBar
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Medicine
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Medicine</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Medicine Name</Label>
                        <Input
                          id="name"
                          value={newMedicine.name}
                          onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="quantity">Initial Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          value={newMedicine.quantity}
                          onChange={(e) => setNewMedicine(prev => ({ ...prev, quantity: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="threshold">Threshold</Label>
                        <Input
                          id="threshold"
                          type="number"
                          value={newMedicine.threshold}
                          onChange={(e) => setNewMedicine(prev => ({ ...prev, threshold: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleAddMedicine} className="mt-2">
                        Add Medicine
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStock.map((item) => (
                  <StockCard
                    key={item.id}
                    {...item}
                    onUpdateQuantity={updateQuantity}
                    onDelete={handleDeleteMedicine}
                  />
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminStock;
