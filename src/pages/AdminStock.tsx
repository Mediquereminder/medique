import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Plus, Trash2, AlertTriangle, Eye, Pill, Package, Shield } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
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
  DialogDescription,
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
import { addMedication } from "@/utils/medicationService";

interface Patient {
  id: string;
  name: string;
  email: string;
  userId: string;
}

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
  patientId: string;
  expiryDate?: string;
}

const frequencyOptions = [
  { value: "daily", label: "Once Daily" },
  { value: "twice-daily", label: "Twice Daily" }, 
  { value: "weekly", label: "Weekly" }
];

const AdminStock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [stock, setStock] = useState<MedicationStock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    threshold: "",
    expiryDate: ""
  });
  
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    description: ""
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMedicationDialogOpen, setIsMedicationDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email || user.role !== "admin") {
      navigate("/login");
    }
    setCurrentUser(user);
    
    // Load patients
    loadPatients(user);
    
    // Load stock
    const savedStock = localStorage.getItem("medicationStock");
    const initialStock = savedStock ? JSON.parse(savedStock) : [];
    setStock(initialStock);
  }, [navigate]);
  
  const loadPatients = (user: any) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Get connected patients for this caretaker
    const connectedPatientIds = user.connectedPatients || [];
    
    // Filter for only connected patients
    const patientList = allUsers
      .filter((u: any) => u.role === "patient" && connectedPatientIds.includes(u.userId))
      .map((u: any) => ({
        id: u.userId,
        name: u.name,
        email: u.email,
        userId: u.userId
      }));
    
    setPatients(patientList);
    
    // Check if there's a selected patient in localStorage
    const selectedId = localStorage.getItem("selectedPatientId");
    if (selectedId && patientList.some(p => p.id === selectedId)) {
      setSelectedPatientId(selectedId);
    }
  };

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

    const medicineUpdated = stock.find(m => m.id === id);
    if (medicineUpdated && change < 0) {
      // Only add to history if medicine is taken (quantity decreases)
      const historyEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        medicine: medicineUpdated.name,
        quantity: Math.abs(change).toString(),
        patientId: medicineUpdated.patientId,
        taken: true // Set taken to true when medication is taken
      };
      
      const savedHistory = localStorage.getItem("medicationHistory");
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      localStorage.setItem("medicationHistory", JSON.stringify([...history, historyEntry]));
      
      toast({
        title: "Medicine Taken",
        description: `${Math.abs(change)} ${medicineUpdated.name} ${Math.abs(change) > 1 ? 'pills have' : 'pill has'} been taken.`,
      });
    } else {
      toast({
        title: "Stock Updated",
        description: "Medication stock has been successfully updated.",
      });
    }
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
      expiryDate: newMedicine.expiryDate
    };

    setStock((prev) => [...prev, newItem]);
    setNewMedicine({ name: "", quantity: "", threshold: "", expiryDate: "" });
    setIsDialogOpen(false);

    toast({
      title: "Medicine Added",
      description: `New medicine has been added to ${patients.find(p => p.id === selectedPatientId)?.name}'s inventory.`,
    });
  };
  
  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !selectedPatientId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a patient",
        variant: "destructive",
      });
      return;
    }
    
    // Add medication to the schedule with the 'active' property
    const medication = {
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      time: newMedication.time,
      startDate: newMedication.startDate,
      endDate: newMedication.endDate || undefined,
      description: newMedication.description || undefined,
      patientId: selectedPatientId,
      createdBy: currentUser.userId,
      active: true // Add the missing 'active' property
    };
    
    addMedication(medication);
    
    // Also add to medication stock if not already there
    const existingStock = stock.find(item => 
      item.name.toLowerCase() === newMedication.name.toLowerCase() && 
      item.patientId === selectedPatientId
    );
    
    if (!existingStock) {
      const newItem: MedicationStock = {
        id: Date.now().toString() + "-stock",
        name: newMedication.name,
        quantity: 30, // Default starting quantity
        threshold: 5,  // Default threshold
        lastUpdated: new Date().toISOString().split("T")[0],
        patientId: selectedPatientId
      };
      
      setStock((prev) => [...prev, newItem]);
    }
    
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      time: "08:00",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      description: ""
    });
    
    setIsMedicationDialogOpen(false);
    
    toast({
      title: "Medication Scheduled",
      description: `New medication has been scheduled for ${patients.find(p => p.id === selectedPatientId)?.name}.`,
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
    localStorage.setItem("selectedPatientId", patientId);
  };

  const filteredStock = stock.filter((item) => 
    (selectedPatientId ? item.patientId === selectedPatientId : true) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row md:items-end gap-6 mb-6">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="patient-select" className="mb-2 block">Select Patient</Label>
                  <Select onValueChange={handlePatientChange} value={selectedPatientId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.length > 0 ? (
                        patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-patients" disabled>
                          No connected patients
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-1/2">
                  <SearchBar
                    value={searchQuery}
                    onChange={(value) => setSearchQuery(value)}
                  />
                </div>
              </div>
              
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Add Medication Button */}
                <Dialog open={isMedicationDialogOpen} onOpenChange={setIsMedicationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2 w-full sm:w-auto"
                      disabled={!selectedPatientId}
                      variant="default"
                    >
                      <Clock className="h-4 w-4" />
                      Add Scheduled Medication
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Schedule New Medication</DialogTitle>
                      <DialogDescription>
                        Fill in the details to add a new medication schedule.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {selectedPatient && (
                        <div className="bg-primary/10 p-2 rounded-md">
                          <p className="text-sm">Scheduling for: <strong>{selectedPatient.name}</strong></p>
                        </div>
                      )}
                      
                      <div className="grid gap-2">
                        <Label htmlFor="med-name">Medicine Name</Label>
                        <Input
                          id="med-name"
                          value={newMedication.name}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Aspirin"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="dosage">Dosage</Label>
                        <Input
                          id="dosage"
                          value={newMedication.dosage}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                          placeholder="e.g., 1 tablet"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="frequency">Frequency</Label>
                          <Select 
                            value={newMedication.frequency} 
                            onValueChange={(value) => setNewMedication(prev => ({ ...prev, frequency: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              {frequencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="time">Time</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newMedication.time}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={newMedication.startDate}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="end-date">End Date (Optional)</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={newMedication.endDate}
                            onChange={(e) => setNewMedication(prev => ({ ...prev, endDate: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input
                          id="description"
                          value={newMedication.description}
                          onChange={(e) => setNewMedication(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Special instructions..."
                        />
                      </div>
                      
                      <Button onClick={handleAddMedication} className="mt-2">
                        Schedule Medication
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                {/* Add to Inventory Button */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2 w-full sm:w-auto" 
                      disabled={!selectedPatientId}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Inventory
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add to Inventory</DialogTitle>
                      <DialogDescription>
                        Enter medication details to add to patient's inventory.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {selectedPatient && (
                        <div className="bg-muted p-2 rounded-md">
                          <p className="text-sm">Adding to inventory for: <strong>{selectedPatient.name}</strong></p>
                        </div>
                      )}
                      
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
                      <div className="grid gap-2">
                        <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                        <Input
                          id="expiry"
                          type="date"
                          value={newMedicine.expiryDate}
                          onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                      <Button onClick={handleAddMedicine} className="mt-2">
                        Add Medicine
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
