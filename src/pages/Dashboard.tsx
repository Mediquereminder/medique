
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Clock, CheckCircle, Timer, ArrowLeft, ArrowRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";

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

// Sample data - in a real app, this would come from an API
const initialMedications = [
  {
    id: 1,
    name: "Aspirin",
    time: "2 hours ago",
    dosage: "1 tablet",
    status: "taken",
  },
  {
    id: 2,
    name: "Vitamin C",
    time: "1 hour ago",
    dosage: "2 tablets",
    status: "taken",
  },
  {
    id: 3,
    name: "Paracetamol",
    time: "In 30 minutes",
    dosage: "2 tablets",
    status: "current",
  },
  {
    id: 4,
    name: "Vitamin D",
    time: "In 3 hours",
    dosage: "1 capsule",
    status: "upcoming",
  },
  {
    id: 5,
    name: "Iron Supplement",
    time: "In 5 hours",
    dosage: "1 tablet",
    status: "upcoming",
  },
  {
    id: 6,
    name: "Omega-3",
    time: "In 8 hours",
    dosage: "2 capsules",
    status: "upcoming",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [randomFact, setRandomFact] = useState("");
  const [medications, setMedications] = useState(initialMedications);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
    // Set a random medical fact
    const randomIndex = Math.floor(Math.random() * medicalFacts.length);
    setRandomFact(medicalFacts[randomIndex]);
  }, [navigate]);

  const handleMarkAsTaken = (id) => {
    // Set animating state to trigger the shift animation
    setAnimating(true);
    
    // After a brief delay to allow animation to complete
    setTimeout(() => {
      // Update medications list
      const updatedMedications = medications.map(med => 
        med.id === id ? { ...med, status: "taken", time: "Just now" } : med
      );
      
      // Move timeline position to the right
      setTimelinePosition(prev => prev + 1);
      setMedications(updatedMedications);
      setAnimating(false);
    }, 500); // Match this with the animation duration
  };

  // Get medications for the timeline based on current position
  const getTimelineMedications = () => {
    const takenMeds = medications.filter(med => med.status === "taken");
    const currentMed = medications.find(med => med.status === "current");
    const upcomingMeds = medications.filter(med => med.status === "upcoming");
    
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
        <AppSidebar role="patient" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">Medique</div>
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
                <h2 className="text-2xl font-bold text-primary mb-8">Medication Timeline</h2>
                
                {/* Timeline Navigation */}
                <div className="flex justify-between items-center w-full max-w-3xl mb-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTimelinePosition(Math.max(0, timelinePosition - 1))}
                    disabled={timelinePosition === 0 || animating}
                    className="flex gap-2 items-center"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-muted-foreground text-sm">
                    Showing {timelinePosition + 1} of {Math.max(1, medications.length - 2)}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTimelinePosition(Math.min(medications.length - 3, timelinePosition + 1))}
                    disabled={timelinePosition >= medications.length - 3 || animating}
                    className="flex gap-2 items-center"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Smooth Timeline Slider */}
                <div className="w-full max-w-5xl mx-auto relative overflow-hidden py-12">
                  <div 
                    className={`
                      flex gap-8 justify-center w-full
                      transition-all duration-500 ease-in-out
                      ${animating ? '-translate-x-[calc(100%/3+1rem)]' : ''}
                    `}
                  >
                    {timelineMeds.map((med, index) => (
                      <Card
                        key={med.id}
                        className={`
                          transform transition-all duration-300 hover:shadow-xl
                          w-1/3 p-6 flex-shrink-0
                          ${
                            med.status === "taken"
                              ? "bg-card/90 border-l-4 border-l-green-500 hover:-translate-y-1"
                              : med.status === "current"
                              ? "bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg border-l-4 border-l-primary hover:-translate-y-2"
                              : "bg-card/90 border-l-4 border-l-blue-400 hover:-translate-y-1"
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-4">
                          {med.status === "taken" && <CheckCircle className="w-12 h-12 text-green-500" />}
                          {med.status === "current" && <Timer className="w-16 h-16 text-primary animate-pulse" />}
                          {med.status === "upcoming" && <Clock className="w-12 h-12 text-blue-500" />}
                          
                          <h3 className={`${med.status === "current" ? "text-2xl font-bold" : "text-xl font-semibold"}`}>
                            {med.status === "taken" ? "Taken" : med.status === "current" ? "Next Dose" : "Upcoming"}
                          </h3>
                          
                          <div className="text-center">
                            <p className={`${med.status === "current" ? "text-xl" : "text-lg"} font-medium text-primary`}>
                              {med.name}
                            </p>
                            <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-muted-foreground`}>
                              {med.time}
                            </p>
                            <p className={`${med.status === "current" ? "text-lg" : "text-sm"} text-muted-foreground`}>
                              {med.dosage}
                            </p>
                          </div>
                          
                          {med.status === "current" && (
                            <Button 
                              className="mt-4 w-full hover:bg-green-500 transition-colors"
                              onClick={() => handleMarkAsTaken(med.id)}
                            >
                              Mark as Taken
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Medical Fact Section */}
                <div className="mt-12 text-center max-w-2xl">
                  <div className="bg-accent text-accent-foreground rounded-lg p-6 shadow-sm border border-accent/30">
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
