
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  name: string;
  email: string;
}

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
  patientId: string;
}

const initialPatients: Patient[] = [
  { id: "p1", name: "John Doe", email: "john@example.com" },
  { id: "p2", name: "Jane Smith", email: "jane@example.com" },
];

const initialStock: MedicationStock[] = [
  {
    id: "1",
    name: "Aspirin",
    quantity: 150,
    threshold: 50,
    lastUpdated: "2024-03-15",
    patientId: "p1",
  },
  {
    id: "2",
    name: "Vitamin C",
    quantity: 75,
    threshold: 30,
    lastUpdated: "2024-03-14",
    patientId: "p1",
  },
  {
    id: "3",
    name: "Paracetamol",
    quantity: 25,
    threshold: 40,
    lastUpdated: "2024-03-13",
    patientId: "p2",
  },
];

const AdminStock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : initialPatients;
  });
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [stock, setStock] = useState<MedicationStock[]>(() => {
    const savedStock = localStorage.getItem("medicationStock");
    return savedStock ? JSON.parse(savedStock) : initialStock;
  });
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

  useEffect(() => {
    // Save stock to localStorage whenever it changes
    localStorage.setItem("medicationStock", JSON.stringify(stock));
  }, [stock]);

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
    if (!newMedicine.name || !newMedicine.quantity || !newMedicine.threshold || !selectedPatientId) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a patient",
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
      patientId: selectedPatientId,
    };

    setStock((prev) => [...prev, newItem]);
    setNewMedicine({ name: "", quantity: "", threshold: "" });
    setIsDialogOpen(false);

    toast({
      title: "Medicine Added",
      description: `New medicine has been added to ${patients.find(p => p.id === selectedPatientId)?.name}'s inventory.`,
    });
  };

  const handleDeleteMedicine = (id: string) => {
    setStock((prev) => prev.filter((item) => item.id !== id));
    toast({
      title: "Medicine Removed",
      description: "Medicine has been removed from the inventory.",
    });
  };

  const handlePatientChange = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const filteredStock = stock.filter((item) => 
    (selectedPatientId ? item.patientId === selectedPatientId : true) &&
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
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                <div className="w-full lg:w-1/4">
                  <Label htmlFor="patient-select" className="mb-2 block">Select Patient</Label>
                  <Select onValueChange={handlePatientChange} value={selectedPatientId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-1 lg:flex lg:items-center gap-4">
                  <div className="flex-1 mb-4 lg:mb-0">
                    <SearchBar
                      value={searchQuery}
                      onChange={(value) => setSearchQuery(value)}
                    />
                  </div>
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 w-full lg:w-auto">
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
                          <Label htmlFor="patient">Patient</Label>
                          <Select 
                            value={selectedPatientId} 
                            onValueChange={setSelectedPatientId}
                            disabled={!selectedPatientId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a patient" />
                            </SelectTrigger>
                            <SelectContent>
                              {patients.map((patient) => (
                                <SelectItem key={patient.id} value={patient.id}>
                                  {patient.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
              </div>

              {selectedPatientId ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredStock.map((item) => (
                    <StockCard
                      key={item.id}
                      {...item}
                      onUpdateQuantity={updateQuantity}
                      onDelete={handleDeleteMedicine}
                    />
                  ))}
                  {filteredStock.length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      <p className="text-lg font-medium">No medicines found</p>
                      <p className="text-sm">Add some medicines to this patient's inventory</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
                  <p className="text-lg font-medium text-gray-700">Please select a patient to view their medication stock</p>
                  <p className="text-sm text-gray-500 mt-2">You'll be able to view and manage their medicines after selection</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminStock;
