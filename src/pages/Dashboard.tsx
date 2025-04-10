import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, AlertCircle } from "lucide-react";
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
import { format, parseISO, isValid } from "date-fns";

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
  timeLimit?: number; // Time limit in minutes
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

  const formatNextDose = (nextDoseStr: string) => {
    try {
      // First check if the string is a valid date
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        console.error("Invalid date string:", nextDoseStr);
        return "Schedule pending";
      }
      
      const now = new Date();
      
      // Check if it's today
      if (
        nextDoseDate.getDate() === now.getDate() &&
        nextDoseDate.getMonth() === now.getMonth() &&
        nextDoseDate.getFullYear() === now.getFullYear()
      ) {
        return `Today at ${format(nextDoseDate, 'h:mm a')}`;
      }
      
      // Check if it's tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (
        nextDoseDate.getDate() === tomorrow.getDate() &&
        nextDoseDate.getMonth() === tomorrow.getMonth() &&
        nextDoseDate.getFullYear() === tomorrow.getFullYear()
      ) {
        return `Tomorrow at ${format(nextDoseDate, 'h:mm a')}`;
      }
      
      // Otherwise show full date
      return format(nextDoseDate, 'MMM d, h:mm a');
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Schedule pending";
    }
  };

  const isUpcoming = (nextDoseStr: string) => {
    try {
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        return false;
      }
      
      const now = new Date();
      
      // Consider it upcoming if it's within the next 3 hours
      const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      return nextDoseDate <= threeHoursFromNow && nextDoseDate > now;
    } catch (error) {
      console.error("Error checking if date is upcoming:", error);
      return false;
    }
  };

  const isOverdue = (nextDoseStr: string) => {
    try {
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        return false;
      }
      
      const now = new Date();
      return nextDoseDate < now;
    } catch (error) {
      console.error("Error checking if date is overdue:", error);
      return false;
    }
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

  // Function to calculate the time limit window text
  const getTimeLimitText = (nextDoseStr: string, timeLimit?: number) => {
    if (!timeLimit) return null;
    
    try {
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        return `Take within ${timeLimit} min of scheduled time`;
      }
      
      const endTime = new Date(nextDoseDate.getTime() + (timeLimit * 60 * 1000));
      return `Take within ${timeLimit} min (by ${format(endTime, 'h:mm a')})`;
    } catch (error) {
      console.error("Error calculating time limit text:", error);
      return `Take within ${timeLimit} min of scheduled time`;
    }
  };

  // Function to check if a medication is within its time limit window
  const isWithinTimeLimit = (nextDoseStr: string, timeLimit?: number) => {
    if (!timeLimit) return true;
    
    try {
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        return false;
      }
      
      const now = new Date();
      const endTime = new Date(nextDoseDate.getTime() + (timeLimit * 60 * 1000));
      
      return now >= nextDoseDate && now <= endTime;
    } catch (error) {
      console.error("Error checking if within time limit:", error);
      return false;
    }
  };

  // Function to get the time remaining in the time window
  const getTimeRemaining = (nextDoseStr: string, timeLimit?: number) => {
    if (!timeLimit) return null;
    
    try {
      const nextDoseDate = parseISO(nextDoseStr);
      
      if (!isValid(nextDoseDate)) {
        return null;
      }
      
      const now = new Date();
      const endTime = new Date(nextDoseDate.getTime() + (timeLimit * 60 * 1000));
      
      if (now < nextDoseDate) return null; // Time window hasn't started
      if (now > endTime) return null; // Time window has ended
      
      const remainingMs = endTime.getTime() - now.getTime();
      const remainingMin = Math.floor(remainingMs / (60 * 1000));
      
      return remainingMin;
    } catch (error) {
      console.error("Error calculating time remaining:", error);
      return null;
    }
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
                          <DialogDescription>
                            Fill in when you'd like to take your medication
                          </DialogDescription>
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
                      <Card 
                        key={medication.id} 
                        className={`overflow-hidden transition-all duration-300 ${
                          medication.isTaken ? 'opacity-70' : 
                          (isOverdue(medication.nextDose) && !isWithinTimeLimit(medication.nextDose, medication.timeLimit)) ? 'border-red-500 border-2' : 
                          (isUpcoming(medication.nextDose)) ? 'border-amber-300' : ''
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{medication.name}</h3>
                              <div className={`flex items-center mt-1 text-sm ${getNextDoseClass(medication.nextDose)}`}>
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{formatNextDose(medication.nextDose)}</span>
                              </div>
                              
                              {medication.timeLimit && (
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                  <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                                  <span>
                                    {isOverdue(medication.nextDose) ? 
                                      (isWithinTimeLimit(medication.nextDose, medication.timeLimit) ? 
                                        `${getTimeRemaining(medication.nextDose, medication.timeLimit)} minutes remaining` : 
                                        'Time window expired') : 
                                      getTimeLimitText(medication.nextDose, medication.timeLimit)
                                    }
                                  </span>
                                </div>
                              )}
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
                            disabled={medication.isTaken || (isOverdue(medication.nextDose) && !isWithinTimeLimit(medication.nextDose, medication.timeLimit))}
                            onClick={() => handleTakeMedication(medication.id)}
                          >
                            {medication.isTaken ? "Already Taken" : 
                             (isOverdue(medication.nextDose) && !isWithinTimeLimit(medication.nextDose, medication.timeLimit)) ? 
                              "Time Window Expired" : "Mark as Taken"}
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
