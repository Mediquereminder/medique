import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Clock, CheckCircle2, Timer, ArrowLeft, ArrowRight, Bell } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { 
  getUpcomingSchedules, 
  getTodaySchedules, 
  markMedicationTaken,
  checkDueMedications,
  checkMissedMedications,
  MedicationSchedule
} from "@/utils/medicationService";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

// Sample medical facts
const medicalFacts = [
  "Taking medications at the same time each day helps build a routine and improves adherence.",
  "Drinking enough water with medications helps them dissolve properly in your system.",
  "Some medications are best taken with food to prevent stomach upset.",
  "Regular exercise can help improve the effectiveness of many medications.",
  "Always complete your prescribed course of antibiotics, even if you feel better.",
  "Store your medications in a cool, dry place away from direct sunlight.",
  "Never share your prescription medications with others, even if they have similar symptoms.",
  "Keep a detailed record of any side effects to discuss with your healthcare provider.",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [randomFact, setRandomFact] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "patient">("patient");
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [clickedMedId, setClickedMedId] = useState(null);
  const [upcomingMedications, setUpcomingMedications] = useState<any[]>([]);
  const [todayMedications, setTodayMedications] = useState<any[]>([]);
  const [allMedications, setAllMedications] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    
    if (user.role === "admin") {
      setUserRole("admin");
    } else {
      setUserRole("patient");
    }
    
    setUserId(user.userId || "");
    
    // Set a random medical fact
    const randomIndex = Math.floor(Math.random() * medicalFacts.length);
    setRandomFact(medicalFacts[randomIndex]);
    
    // Initialize medication storage if it doesn't exist
    if (!localStorage.getItem("medications")) {
      localStorage.setItem("medications", JSON.stringify([]));
    }
    
    if (!localStorage.getItem("medicationSchedules")) {
      localStorage.setItem("medicationSchedules", JSON.stringify([]));
    }
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    
    // Load upcoming medications
    const loadMedications = () => {
      const upcoming = getUpcomingSchedules(userId);
      const today = getTodaySchedules(userId);
      
      // Fetch medication details for each schedule
      const medications = JSON.parse(localStorage.getItem("medications") || "[]");
      
      const enrichedUpcoming = upcoming.map((schedule: MedicationSchedule) => {
        const medication = medications.find((med: any) => med.id === schedule.medicationId);
        
        return {
          id: schedule.id,
          name: medication?.name || "Unknown medication",
          time: format(parseISO(schedule.scheduledTime), "h:mm a"),
          scheduledTime: schedule.scheduledTime,
          dosage: medication?.dosage || "1 tablet",
          status: isDueNow(schedule.scheduledTime) ? "current" : "upcoming",
          patientId: schedule.patientId,
        };
      });
      
      const enrichedToday = today.map((schedule: MedicationSchedule) => {
        const medication = medications.find((med: any) => med.id === schedule.medicationId);
        
        return {
          id: schedule.id,
          name: medication?.name || "Unknown medication",
          time: format(parseISO(schedule.scheduledTime), "h:mm a"),
          scheduledTime: schedule.scheduledTime,
          dosage: medication?.dosage || "1 tablet",
          status: schedule.taken ? "taken" : 
                isDueNow(schedule.scheduledTime) ? "current" : "upcoming",
          patientId: schedule.patientId,
        };
      });
      
      setUpcomingMedications(enrichedUpcoming);
      setTodayMedications(enrichedToday);
      setAllMedications([
        ...enrichedToday.filter((med: any) => med.status === "taken"),
        ...enrichedToday.filter((med: any) => med.status === "current"),
        ...enrichedUpcoming
      ]);
    };
    
    loadMedications();
    
    // Check for due and missed medications
    checkDueMedications();
    checkMissedMedications();
    
    // Set interval to refresh medications and check due/missed ones
    const interval = setInterval(() => {
      loadMedications();
      checkDueMedications();
      checkMissedMedications();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [userId, toast]);

  const isDueNow = (scheduledTime: string) => {
    const now = new Date();
    const scheduled = parseISO(scheduledTime);
    const diffMinutes = (scheduled.getTime() - now.getTime()) / (1000 * 60);
    
    // Consider "due now" if within 1 hour before or after scheduled time
    return diffMinutes >= -60 && diffMinutes <= 60;
  };

  const handleMarkAsTaken = (id: string) => {
    // Set the clicked medication ID for targeted animation
    setClickedMedId(id);
    
    // Set animating state to trigger the shift animation
    setAnimating(true);
    
    // After a brief delay to allow animation to complete
    setTimeout(() => {
      // Mark medication as taken in backend
      markMedicationTaken(id);
      
      // Update UI
      setAllMedications(prev => 
        prev.map(med => 
          med.id === id ? { ...med, status: "taken", time: "Just now" } : med
        )
      );
      
      // Move timeline position to the right
      setTimelinePosition(prev => prev + 1);
      
      // Reset animation states
      setAnimating(false);
      setClickedMedId(null);
      
      // Show toast
      toast({
        title: "Medication Taken",
        description: "Great job! Your medication has been marked as taken.",
      });
    }, 600); // Slightly longer to match animation duration
  };

  // Get medications for the timeline based on current position
  const getTimelineMedications = () => {
    const takenMeds = allMedications.filter(med => med.status === "taken");
    const currentMed = allMedications.find(med => med.status === "current");
    const upcomingMeds = allMedications.filter(med => med.status === "upcoming");
    
    // Determine which medications to display based on timeline position
    let displayMeds = [];
    
    // Always try to show one taken, one current, and one upcoming medication
    if (timelinePosition < takenMeds.length) {
      // Show a taken medication on the left
      displayMeds.push(takenMeds[takenMeds.length - 1 - timelinePosition]);
    }
    
    // Show the current medication in the middle (if there is one)
    if (currentMed) {
      displayMeds.push(currentMed);
    }
    
    // Show an upcoming medication on the right
    if (upcomingMeds.length > 0 && timelinePosition < upcomingMeds.length) {
      displayMeds.push(upcomingMeds[timelinePosition]);
    }
    
    // If we don't have 3 medications to show, add more upcoming ones
    while (displayMeds.length < 3 && upcomingMeds.length > displayMeds.filter(med => med.status === "upcoming").length) {
      const nextIndex = displayMeds.filter(med => med.status === "upcoming").length;
      if (upcomingMeds[nextIndex]) {
        displayMeds.push(upcomingMeds[nextIndex]);
      } else {
        break;
      }
    }
    
    // If we still don't have 3 medications, add more taken ones
    while (displayMeds.length < 3 && takenMeds.length > displayMeds.filter(med => med.status === "taken").length) {
      const nextIndex = displayMeds.filter(med => med.status === "taken").length;
      if (takenMeds[nextIndex]) {
        displayMeds.push(takenMeds[nextIndex]);
      } else {
        break;
      }
    }
    
    return displayMeds;
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const timelineMeds = getTimelineMedications();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role={userRole} />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/b81c9421-0f7b-46a1-aec0-86a7739c4803.png" 
                  alt="Medique Logo" 
                  className="h-8 w-auto ml-12"
                />
                <div className="text-2xl font-semibold text-primary">Medique</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-primary mb-8 animate-fadeIn">Medication Timeline</h2>
                
                {/* Empty State if no medications */}
                {allMedications.length === 0 && (
                  <Card className="w-full max-w-lg p-6 text-center mb-8">
                    <div className="py-10 flex flex-col items-center gap-4">
                      <Bell className="h-16 w-16 text-muted-foreground" />
                      <h3 className="text-xl font-semibold">No Medications Yet</h3>
                      {userRole === "admin" ? (
                        <p className="text-muted-foreground">Add medications for your patients in the Stock section.</p>
                      ) : (
                        <p className="text-muted-foreground">Your caretaker will add medications to your schedule soon.</p>
                      )}
                      <Button onClick={() => navigate("/dashboard/stock")} className="mt-4">
                        Go to Stock
                      </Button>
                    </div>
                  </Card>
                )}
                
                {allMedications.length > 0 && (
                  <>
                    {/* Timeline Navigation */}
                    <div className="flex justify-between items-center w-full max-w-3xl mb-6 animate-fadeIn" style={{ animationDelay: "200ms" }}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))}
                        disabled={timelinePosition === 0 || animating}
                        className="flex gap-2 items-center transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      
                      <div className="text-muted-foreground text-sm font-medium">
                        Showing {timelinePosition + 1} of {Math.max(1, allMedications.length - 2)}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setTimelinePosition(Math.min(allMedications.length - 3, timelinePosition + 1))}
                        disabled={timelinePosition >= allMedications.length - 3 || animating}
                        className="flex gap-2 items-center transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Smooth Timeline Slider */}
                    <div className="w-full max-w-5xl mx-auto relative overflow-hidden py-12 rounded-xl" style={{ perspective: "1000px" }}>
                      <div 
                        className={`
                          flex gap-8 justify-center w-full
                          transition-all duration-600 ease-in-out
                          ${animating ? 'transform -translate-x-[calc(100%/3+1rem)]' : ''}
                        `}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {timelineMeds.map((med) => (
                          <Card
                            key={med.id}
                            className={`
                              w-1/3 p-6 flex-shrink-0 relative overflow-hidden border-0
                              ${
                                med.status === "taken"
                                  ? "bg-card/90 border-l-4 border-l-green-500" 
                                  : med.status === "current"
                                  ? "bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl border-l-4 border-l-primary"
                                  : "bg-card/90 border-l-4 border-l-blue-400" 
                              }
                              ${clickedMedId === med.id ? 'pulse-once scale-105' : ''}
                              transition-all duration-500 ease-in-out
                              hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                              before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r 
                              before:from-transparent before:via-white/10 before:to-transparent 
                              before:translate-x-[-100%] before:skew-x-[-20deg] before:animate-shimmer
                            `}
                            style={{
                              boxShadow: med.status === "current" 
                                ? "0 10px 25px -5px rgba(79, 209, 197, 0.3)" 
                                : "",
                            }}
                          >
                            <div className="flex flex-col items-center gap-4 relative z-10">
                              {med.status === "taken" && 
                                <CheckCircle2 className="w-12 h-12 text-green-500 animate-fadeIn" />
                              }
                              {med.status === "current" && 
                                <div className="relative">
                                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                                  <Timer className="w-16 h-16 text-primary relative z-10" />
                                </div>
                              }
                              {med.status === "upcoming" && 
                                <Clock className="w-12 h-12 text-blue-500 animate-fadeIn" />
                              }
                              
                              <h3 className={`${med.status === "current" ? "text-2xl font-bold" : "text-xl font-semibold"} transition-all duration-300`}>
                                {med.status === "taken" ? "Taken" : med.status === "current" ? "Next Dose" : "Upcoming"}
                              </h3>
                              
                              <div className="text-center">
                                <p className={`${med.status === "current" ? "text-xl" : "text-lg"} font-medium text-primary transition-all duration-300`}>
                                  {med.name}
                                </p>
                                <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-muted-foreground transition-all duration-300`}>
                                  {med.time}
                                </p>
                                <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-muted-foreground transition-all duration-300`}>
                                  {med.dosage}
                                </p>
                              </div>
                              
                              {med.status === "current" && (
                                <Button 
                                  className="mt-4 w-full group relative overflow-hidden"
                                  onClick={() => handleMarkAsTaken(med.id)}
                                >
                                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-green-500 transition-transform duration-300 transform translate-y-full group-hover:translate-y-0"></span>
                                  <span className="relative flex items-center justify-center gap-2 transition-all duration-300 group-hover:text-white">
                                    <CheckCircle2 className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                    Mark as Taken
                                  </span>
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Medical Fact Section */}
                <div className="mt-12 text-center max-w-2xl animate-fadeIn" style={{ animationDelay: "400ms" }}>
                  <div className="bg-accent text-accent-foreground rounded-lg p-6 shadow-sm border border-accent/30 hover-lift">
                    <h3 className="text-lg font-semibold text-primary mb-2">💡 Did you know?</h3>
                    <p className="text-card-foreground">{randomFact}</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
