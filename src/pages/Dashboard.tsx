import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StockNavbar } from "@/components/stock/StockNavbar";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  nextDose: string;
  schedule: string;
  patientId: string;
  dosesTaken: number;
  dosesRemaining: number;
  isTaken: boolean;
  lastTaken?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedicationTime, setNewMedicationTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!storedUser.email) {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);

    // Load medications from localStorage
    const allMedications = JSON.parse(localStorage.getItem("medications") || "[]");
    const userMedications = allMedications.filter(
      (med: Medication) => med.patientId === storedUser.userId
    );
    
    // Sort by next dose time
    userMedications.sort((a: Medication, b: Medication) => {
      const dateA = new Date(a.nextDose).getTime();
      const dateB = new Date(b.nextDose).getTime();
      return dateA - dateB;
    });
    
    setMedications(userMedications);
  }, [navigate]);

  const formatNextDose = (nextDose: string) => {
    const nextDoseDate = new Date(nextDose);
    const now = new Date();
    
    // Check if it's today
    if (
      nextDoseDate.getDate() === now.getDate() &&
      nextDoseDate.getMonth() === now.getMonth() &&
      nextDoseDate.getFullYear() === now.getFullYear()
    ) {
      return `Today at ${nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Check if it's tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      nextDoseDate.getDate() === tomorrow.getDate() &&
      nextDoseDate.getMonth() === tomorrow.getMonth() &&
      nextDoseDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `Tomorrow at ${nextDoseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return nextDoseDate.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUpcoming = (nextDose: string) => {
    const nextDoseDate = new Date(nextDose);
    const now = new Date();
    
    // Consider it upcoming if it's within the next 3 hours
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    return nextDoseDate <= threeHoursFromNow && nextDoseDate > now;
  };

  const isOverdue = (nextDose: string) => {
    const nextDoseDate = new Date(nextDose);
    const now = new Date();
    return nextDoseDate < now;
  };

  const getNextDoseClass = (nextDose: string) => {
    if (isOverdue(nextDose)) {
      return "text-red-500";
    }
    if (isUpcoming(nextDose)) {
      return "text-amber-500";
    }
    return "text-green-500";
  };

  const handleTakeMedication = (medicationId: string) => {
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      try {
        // Update the medication in localStorage
        const allMedications = JSON.parse(localStorage.getItem("medications") || "[]");
        const medicationIndex = allMedications.findIndex((med: Medication) => med.id === medicationId);
        
        if (medicationIndex !== -1) {
          // Update medication
          allMedications[medicationIndex].isTaken = true;
          allMedications[medicationIndex].dosesTaken += 1;
          allMedications[medicationIndex].dosesRemaining -= 1;
          allMedications[medicationIndex].lastTaken = new Date().toISOString();
          
          // Calculate next dose time based on schedule
          const schedule = allMedications[medicationIndex].schedule;
          const [hours] = schedule.split(":");
          const nextDose = new Date();
          nextDose.setHours(nextDose.getHours() + parseInt(hours));
          allMedications[medicationIndex].nextDose = nextDose.toISOString();
          allMedications[medicationIndex].isTaken = false;
          
          // Update stock
          const stock = JSON.parse(localStorage.getItem("medicationStock") || "[]");
          const stockItem = stock.find((item: any) => 
            item.name === allMedications[medicationIndex].name && 
            item.patientId === user.userId
          );
          
          if (stockItem) {
            stockItem.quantity = Math.max(0, stockItem.quantity - 1);
            stockItem.lastUpdated = new Date().toLocaleString();
            localStorage.setItem("medicationStock", JSON.stringify(stock));
            
            // Check if stock is running low
            if (stockItem.quantity <= stockItem.threshold) {
              // Add notification for caretaker
              const users = JSON.parse(localStorage.getItem("users") || "[]");
              const caretakers = users.filter((u: any) => u.role === "caretaker");
              
              caretakers.forEach((caretaker: any) => {
                const notifications = caretaker.notifications || [];
                notifications.push({
                  title: "Low Medication Stock",
                  message: `${allMedications[medicationIndex].name} for ${user.name} is running low (${stockItem.quantity} remaining).`,
                  timestamp: new Date().toISOString(),
                  read: false
                });
                caretaker.notifications = notifications;
              });
              
              localStorage.setItem("users", JSON.stringify(users));
            }
          }
          
          // Save updated medications
          localStorage.setItem("medications", JSON.stringify(allMedications));
          
          // Update state
          const updatedUserMedications = allMedications.filter(
            (med: Medication) => med.patientId === user.userId
          );
          
          // Sort by next dose time
          updatedUserMedications.sort((a: Medication, b: Medication) => {
            const dateA = new Date(a.nextDose).getTime();
            const dateB = new Date(b.nextDose).getTime();
            return dateA - dateB;
          });
          
          setMedications(updatedUserMedications);
          
          // Add to medication history
          const history = JSON.parse(localStorage.getItem("medicationHistory") || "[]");
          history.push({
            medicationId,
            medicationName: allMedications[medicationIndex].name,
            patientId: user.userId,
            patientName: user.name,
            timestamp: new Date().toISOString(),
            action: "taken"
          });
          localStorage.setItem("medicationHistory", JSON.stringify(history));
          
          toast({
            title: "Medication Taken",
            description: `You've successfully taken ${allMedications[medicationIndex].name}.`,
          });
        }
      } catch (error) {
        console.error("Error taking medication:", error);
        toast({
          title: "Error",
          description: "There was a problem recording your medication. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          <LoadingOverlay visible={loading} message="Recording medication..." />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user && user.name ? `Hello, ${user.name}` : 'Hello'}
                </h1>
                <p className="text-muted-foreground">Here are your medication reminders for today</p>
              </div>
              
              <div className="grid gap-6">
                {medications.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">No medications scheduled</h2>
                    <p className="text-muted-foreground mt-2 mb-6">You don't have any medications scheduled at the moment.</p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mx-auto">
                          <Plus className="mr-2 h-4 w-4" />
                          Request Medication
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Request New Medication</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="time" className="text-sm font-medium leading-none">
                              Preferred Time
                            </label>
                            <Input
                              id="time"
                              type="time"
                              value={newMedicationTime}
                              onChange={(e) => setNewMedicationTime(e.target.value)}
                            />
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              // Notify caretaker of request
                              const users = JSON.parse(localStorage.getItem("users") || "[]");
                              const caretakers = users.filter((u: any) => u.role === "caretaker");
                              
                              caretakers.forEach((caretaker: any) => {
                                const notifications = caretaker.notifications || [];
                                notifications.push({
                                  title: "Medication Request",
                                  message: `${user.name} has requested medication at ${newMedicationTime}.`,
                                  timestamp: new Date().toISOString(),
                                  read: false
                                });
                                caretaker.notifications = notifications;
                              });
                              
                              localStorage.setItem("users", JSON.stringify(users));
                              setNewMedicationTime("");
                              
                              toast({
                                title: "Request Sent",
                                description: "Your medication request has been sent to your caretaker.",
                              });
                            }}
                          >
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {medications.map((medication) => (
                      <Card key={medication.id} className={`overflow-hidden transition-all duration-300 ${medication.isTaken ? 'opacity-70' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{medication.name}</h3>
                              <div className={`flex items-center mt-1 text-sm ${getNextDoseClass(medication.nextDose)}`}>
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatNextDose(medication.nextDose)}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{medication.schedule}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">Doses taken</span>
                            <span>{medication.dosesTaken}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm mb-6">
                            <span className="text-muted-foreground">Remaining</span>
                            <span>{medication.dosesRemaining}</span>
                          </div>
                          
                          <Button 
                            className="w-full"
                            disabled={medication.isTaken}
                            onClick={() => handleTakeMedication(medication.id)}
                          >
                            {medication.isTaken ? "Already Taken" : "Mark as Taken"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
