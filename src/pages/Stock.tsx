
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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StockNavbar } from "@/components/stock/StockNavbar";
import { 
  markMedicationTaken, 
  MedicationSchedule 
} from "@/utils/medicationService";
import { format, parseISO, isToday } from "date-fns";

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
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
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
    setUserId(user.userId || "");
    
    // Load medicines
    const savedStock = localStorage.getItem("medicationStock");
    const stockData = savedStock ? JSON.parse(savedStock) : [];
    setMedicines(stockData);
    
    // Load medication schedules
    loadSchedules(user.userId);
    
    // Set up interval to refresh schedules
    const interval = setInterval(() => {
      loadSchedules(user.userId);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [navigate]);

  const loadSchedules = (userId: string) => {
    const scheduleData = JSON.parse(localStorage.getItem("medicationSchedules") || "[]");
    const medications = JSON.parse(localStorage.getItem("medications") || "[]");
    
    // Filter schedules for today and this user
    const today = new Date().toISOString().split('T')[0];
    const userSchedules = scheduleData
      .filter((schedule: MedicationSchedule) => 
        schedule.patientId === userId && 
        schedule.scheduledTime.startsWith(today)
      )
      .map((schedule: MedicationSchedule) => {
        const medication = medications.find((med: any) => med.id === schedule.medicationId);
        return {
          id: schedule.id,
          medicine: medication?.name || "Unknown",
          dosage: medication?.dosage || "1 tablet",
          time: format(parseISO(schedule.scheduledTime), "h:mm a"),
          scheduledTime: schedule.scheduledTime,
          taken: schedule.taken,
          skipped: schedule.skipped
        };
      })
      .sort((a: any, b: any) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      );
    
    setSchedules(userSchedules);
  };

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
    
    // Only add to history if medicine is taken (quantity decreases)
    if (change < 0) {
      const medicineUpdated = medicines.find(m => m.id === id);
      if (medicineUpdated) {
        const historyEntry = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          medicine: medicineUpdated.name,
          quantity: Math.abs(change).toString(),
          patientId: medicineUpdated.patientId || userId,
          taken: true // Set taken to true when medication is taken
        };
        
        const savedHistory = localStorage.getItem("medicationHistory");
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        localStorage.setItem("medicationHistory", JSON.stringify([...history, historyEntry]));
        
        toast({
          title: "Medicine Taken",
          description: `${Math.abs(change)} ${medicineUpdated.name} ${Math.abs(change) > 1 ? 'pills have' : 'pill has'} been taken.`,
        });
      }
    }
  };
  
  const handleMarkTaken = (scheduleId: string) => {
    const result = markMedicationTaken(scheduleId);
    if (result) {
      toast({
        title: "Medication Taken",
        description: "Your medication has been marked as taken."
      });
      
      // Refresh schedules
      loadSchedules(userId);
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
                
                {/* Today's Medication Schedule */}
                <Card className="border-2 border-primary/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Today's Medication Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedules.length > 0 ? (
                      <div className="grid gap-4">
                        {schedules.map((schedule) => (
                          <div 
                            key={schedule.id} 
                            className={`
                              p-4 rounded-lg border-2 flex items-center justify-between
                              ${schedule.taken 
                                ? 'bg-green-50 border-green-200' 
                                : isTimeNearby(schedule.scheduledTime) 
                                  ? 'bg-primary/5 border-primary/20 animate-pulse' 
                                  : 'bg-white border-gray-200'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`
                                p-3 rounded-full 
                                ${schedule.taken 
                                  ? 'bg-green-100 text-green-600'
                                  : isTimeNearby(schedule.scheduledTime)
                                    ? 'bg-primary/10 text-primary animate-bounce'
                                    : 'bg-gray-100 text-gray-600'}
                              `}>
                                <Pill className="w-5 h-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">{schedule.medicine}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {schedule.dosage} at {schedule.time}
                                </p>
                              </div>
                            </div>
                            {!schedule.taken && !schedule.skipped && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="hover:bg-green-50 hover:text-green-600"
                                onClick={() => handleMarkTaken(schedule.id)}
                              >
                                Mark as Taken
                              </Button>
                            )}
                            {schedule.taken && (
                              <div className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Taken
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">No medications scheduled for today</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

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

// Helper function to check if a scheduled time is nearby (within 15 minutes)
const isTimeNearby = (scheduledTime: string) => {
  const now = new Date();
  const scheduled = parseISO(scheduledTime);
  const diffMinutes = Math.abs((scheduled.getTime() - now.getTime()) / (1000 * 60));
  
  return diffMinutes <= 15 && isToday(scheduled);
};

export default Stock;
