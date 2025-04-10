
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
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StockNavbar } from "@/components/stock/StockNavbar";
import LoadingOverlay from "@/components/LoadingOverlay";
import { toast } from "@/hooks/use-toast";
import { getTodaySchedules, markMedicationTaken } from "@/utils/medicationService";
import { format, parseISO } from "date-fns";
import { useReminderChecker } from "@/hooks/useReminderChecker";

interface MedicationSchedule {
  id: string;
  medicationId: string;
  scheduledTime: string; // ISO string
  patientId: string;
  taken: boolean;
  skipped: boolean;
  takenTime?: string; // ISO string, when medication was taken
  medicationName?: string; // Added for display purposes
  medicationDosage?: string; // Added for display purposes
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [newMedicationTime, setNewMedicationTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>({});
  
  // Use the reminder checker hook
  useReminderChecker();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!storedUser.email) {
      navigate("/login");
      return;
    }
    
    setUser(storedUser);

    // Load medications using the medicationService
    loadMedications(storedUser.userId);
    
    // Set up interval to check for new schedules every minute
    const intervalId = setInterval(() => {
      loadMedications(storedUser.userId);
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [navigate]);

  const loadMedications = (userId: string) => {
    // Get today's schedules for the patient
    const todaySchedules = getTodaySchedules(userId);
    
    // Enrich schedules with medication information
    const medications = JSON.parse(localStorage.getItem("medications") || "[]");
    const enrichedSchedules = todaySchedules.map((schedule: MedicationSchedule) => {
      const medication = medications.find((med: any) => med.id === schedule.medicationId);
      return {
        ...schedule,
        medicationName: medication?.name || "Unknown medication",
        medicationDosage: medication?.dosage || ""
      };
    });
    
    // Sort schedules by time
    enrichedSchedules.sort((a: MedicationSchedule, b: MedicationSchedule) => {
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });
    
    setSchedules(enrichedSchedules);
  };

  const formatScheduledTime = (scheduledTime: string) => {
    try {
      // First check if we have a valid date string
      if (!scheduledTime || typeof scheduledTime !== 'string') {
        return "Invalid date";
      }
      
      const scheduledDate = parseISO(scheduledTime);
      
      // Check if date parsing was successful
      if (isNaN(scheduledDate.getTime())) {
        return "Invalid date";
      }
      
      const now = new Date();
      
      // Check if it's today
      if (
        scheduledDate.getDate() === now.getDate() &&
        scheduledDate.getMonth() === now.getMonth() &&
        scheduledDate.getFullYear() === now.getFullYear()
      ) {
        return `Today at ${format(scheduledDate, "h:mm a")}`;
      }
      
      // Check if it's tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (
        scheduledDate.getDate() === tomorrow.getDate() &&
        scheduledDate.getMonth() === tomorrow.getMonth() &&
        scheduledDate.getFullYear() === tomorrow.getFullYear()
      ) {
        return `Tomorrow at ${format(scheduledDate, "h:mm a")}`;
      }
      
      // Otherwise show full date
      return format(scheduledDate, "MMM d, h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error, "for date:", scheduledTime);
      return "Invalid date";
    }
  };

  const isUpcoming = (scheduledTime: string) => {
    try {
      const scheduledDate = parseISO(scheduledTime);
      const now = new Date();
      
      // Consider it upcoming if it's within the next 3 hours
      const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      return scheduledDate <= threeHoursFromNow && scheduledDate > now;
    } catch (error) {
      return false;
    }
  };

  const isOverdue = (scheduledTime: string) => {
    try {
      const scheduledDate = parseISO(scheduledTime);
      const now = new Date();
      return scheduledDate < now;
    } catch (error) {
      return false;
    }
  };

  const getScheduleClass = (scheduledTime: string) => {
    if (isOverdue(scheduledTime)) {
      return "text-red-500";
    }
    if (isUpcoming(scheduledTime)) {
      return "text-amber-500";
    }
    return "text-green-500";
  };

  const handleTakeMedication = (scheduleId: string) => {
    setLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      try {
        // Mark medication as taken using medicationService
        markMedicationTaken(scheduleId);
        
        // Refresh the schedules
        loadMedications(user.userId);
        
        toast({
          title: "Medication Taken",
          description: "Your medication has been recorded.",
        });
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
                {schedules.length === 0 ? (
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
                    {schedules.map((schedule) => (
                      <Card key={schedule.id} className={`overflow-hidden transition-all duration-300 ${schedule.taken ? 'opacity-70' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{schedule.medicationName}</h3>
                              <div className={`flex items-center mt-1 text-sm ${getScheduleClass(schedule.scheduledTime)}`}>
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatScheduledTime(schedule.scheduledTime)}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span className="text-muted-foreground">{schedule.medicationDosage}</span>
                            </div>
                          </div>
                          
                          <Button 
                            className="w-full"
                            disabled={schedule.taken}
                            onClick={() => handleTakeMedication(schedule.id)}
                          >
                            {schedule.taken ? "Already Taken" : "Mark as Taken"}
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
