
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
  {
    id: 7,
    name: "Calcium",
    time: "In 10 hours",
    dosage: "1 tablet",
    status: "upcoming",
  },
  {
    id: 8,
    name: "Magnesium",
    time: "In 12 hours",
    dosage: "1 capsule",
    status: "upcoming",
  },
  {
    id: 9,
    name: "Zinc",
    time: "Tomorrow",
    dosage: "1 tablet",
    status: "upcoming",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [randomFact, setRandomFact] = useState("");
  const [medications, setMedications] = useState(initialMedications);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [clickedMedId, setClickedMedId] = useState(null);
  const [slideDirection, setSlideDirection] = useState("left"); // new state to track animation direction

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
    // Set the clicked medication ID for targeted animation
    setClickedMedId(id);
    
    // Set direction and animating state to trigger the shift animation
    setSlideDirection("left");
    setAnimating(true);
    
    // After a brief delay to allow animation to complete
    setTimeout(() => {
      // Update medications list
      const updatedMedications = medications.map(med => 
        med.id === id ? { ...med, status: "taken", time: "Just now" } : med
      );
      
      // Move timeline position to the right to show more upcoming medications
      setTimelinePosition(prev => prev + 1);
      setMedications(updatedMedications);
      
      // Reset animation states
      setAnimating(false);
      setClickedMedId(null);
    }, 600); // Slightly longer to match animation duration
  };

  // Get medications for the timeline based on current position
  const getTimelineMedications = () => {
    const takenMeds = medications.filter(med => med.status === "taken");
    const currentMed = medications.find(med => med.status === "current");
    const upcomingMeds = medications.filter(med => med.status === "upcoming");
    
    // Determine which medications to display based on timeline position
    let displayMeds = [];
    
    // Show a taken medication on the left (if available and within position range)
    if (timelinePosition < takenMeds.length) {
      // Show a taken medication on the left
      displayMeds.push(takenMeds[takenMeds.length - 1 - timelinePosition]);
    }
    
    // Show the current medication in the middle (if there is one)
    if (currentMed) {
      displayMeds.push(currentMed);
    }
    
    // Show multiple upcoming medications to the right
    const upcomingStartIndex = timelinePosition;
    const maxUpcoming = 3; // Show up to 3 upcoming medications
    
    for (let i = upcomingStartIndex; i < upcomingStartIndex + maxUpcoming; i++) {
      if (i < upcomingMeds.length) {
        displayMeds.push(upcomingMeds[i]);
      }
    }
    
    // If we still don't have enough medications to show (minimum 5 for smooth animation), add more taken ones
    while (displayMeds.length < 5 && takenMeds.length > displayMeds.filter(med => med.status === "taken").length) {
      const nextIndex = displayMeds.filter(med => med.status === "taken").length;
      if (takenMeds[nextIndex]) {
        // Add to the beginning to maintain order
        displayMeds.unshift(takenMeds[nextIndex]);
      } else {
        break;
      }
    }
    
    return displayMeds;
  };

  const handlePrevMedication = () => {
    if (timelinePosition > 0 && !animating) {
      setSlideDirection("right");
      setAnimating(true);
      
      setTimeout(() => {
        setTimelinePosition(prev => prev - 1);
        setAnimating(false);
      }, 600);
    }
  };

  const handleNextMedication = () => {
    const upcomingMeds = medications.filter(med => med.status === "upcoming");
    
    if (timelinePosition < upcomingMeds.length - 1 && !animating) {
      setSlideDirection("left");
      setAnimating(true);
      
      setTimeout(() => {
        setTimelinePosition(prev => prev + 1);
        setAnimating(false);
      }, 600);
    }
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
                <h2 className="text-2xl font-bold text-primary mb-8 animate-fadeIn">Medication Timeline</h2>
                
                {/* Timeline Navigation */}
                <div className="flex justify-between items-center w-full max-w-3xl mb-6 animate-fadeIn" style={{ animationDelay: "200ms" }}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePrevMedication}
                    disabled={timelinePosition === 0 || animating}
                    className="flex gap-2 items-center transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="text-muted-foreground text-sm font-medium">
                    Showing {timelinePosition + 1} of {Math.max(1, medications.filter(med => med.status === "upcoming").length)}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextMedication}
                    disabled={timelinePosition >= medications.filter(med => med.status === "upcoming").length - 1 || animating}
                    className="flex gap-2 items-center transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Pill Ring Timeline */}
                <div className="w-full max-w-5xl mx-auto relative py-12 rounded-xl overflow-hidden" style={{ perspective: "1000px" }}>
                  {/* Timeline ring connection */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-primary to-green-500 rounded-full z-0"></div>
                  
                  {/* Timeline cards attached to ring */}
                  <div 
                    className={`
                      flex justify-center w-full relative
                      transition-all duration-600 ease-in-out
                      ${animating ? (slideDirection === 'left' ? 'transform -translate-x-[calc(100%/5+1rem)]' : 'transform translate-x-[calc(100%/5+1rem)]') : ''}
                    `}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {timelineMeds.map((med, index) => {
                      const isCentered = index === Math.floor(timelineMeds.length / 2) && med.status === "current";
                      const isPast = med.status === "taken";
                      const isUpcoming = med.status === "upcoming";
                      const isFirstUpcoming = med.status === "upcoming" && medications.filter(m => m.status === "upcoming").indexOf(med) === 0;
                      
                      // Determine relative position for sizing and emphasis
                      const isMainCard = isCentered || (currentMed = medications.find(m => m.status === "current")) === undefined && isFirstUpcoming;
                      
                      return (
                        <div 
                          key={med.id}
                          className={`
                            ${isMainCard ? 'z-20 px-2 -translate-y-4' : 'z-10 px-4'}
                            ${index === 0 ? 'text-right' : ''}
                            ${index === timelineMeds.length - 1 ? 'text-left' : ''}
                            transition-all duration-500 relative flex-1
                          `}
                        >
                          {/* Card connector to timeline */}
                          <div 
                            className={`
                              absolute left-1/2 top-1/2 w-1 bg-primary/80 
                              ${isMainCard ? 'h-16' : 'h-8'}
                              transition-all duration-300
                            `} 
                            style={{ transform: 'translateX(-50%)' }}
                          ></div>
                          
                          {/* Timeline node */}
                          <div 
                            className={`
                              absolute left-1/2 top-1/2 rounded-full shadow-lg border-4
                              ${isPast ? 'bg-green-500 border-green-300' : ''}
                              ${isMainCard ? 'bg-primary border-primary-foreground animate-pulse' : ''}
                              ${isUpcoming && !isMainCard ? 'bg-blue-400 border-blue-300' : ''}
                              ${isMainCard ? 'w-6 h-6' : 'w-4 h-4'}
                              transition-all duration-300
                            `} 
                            style={{ transform: 'translate(-50%, -50%)' }}
                          ></div>
                          
                          <Card
                            className={`
                              relative overflow-hidden rounded-3xl
                              ${isPast ? 'bg-gradient-to-br from-[#a7f3d0]/80 to-[#86efac]/80 border-green-300' : ''}
                              ${isMainCard ? 'bg-gradient-to-br from-primary/30 to-primary/10 shadow-xl border-primary' : ''}
                              ${isUpcoming && !isMainCard ? 'bg-gradient-to-br from-[#bfdbfe]/80 to-[#93c5fd]/80 border-blue-300' : ''}
                              ${clickedMedId === med.id ? 'pulse-once' : ''}
                              transition-all duration-500 ease-in-out
                              hover:shadow-2xl hover:-translate-y-1
                              ${isMainCard ? 'scale-110 mt-16 mb-2' : 'mt-8'}
                              before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r 
                              before:from-transparent before:via-white/10 before:to-transparent 
                              before:translate-x-[-100%] before:skew-x-[-20deg] before:animate-shimmer
                            `}
                            style={{
                              boxShadow: isMainCard 
                                ? '0 20px 25px -5px rgba(79, 209, 197, 0.4)' 
                                : '',
                              borderRadius: isMainCard ? '1.5rem' : '1rem',
                              transform: isMainCard ? 'translateY(-0.5rem)' : '',
                            }}
                          >
                            <div className="flex flex-col items-center gap-4 relative z-10 p-6">
                              {isPast && 
                                <CheckCircle className="w-12 h-12 text-green-600 animate-fadeIn" />
                              }
                              {isMainCard && med.status === "current" && 
                                <div className="relative">
                                  <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                                  <Timer className="w-16 h-16 text-primary relative z-10" />
                                </div>
                              }
                              {isUpcoming && 
                                <Clock className="w-12 h-12 text-blue-600 animate-fadeIn" />
                              }
                              
                              <h3 className={`${isMainCard ? "text-2xl font-bold" : "text-xl font-semibold"} transition-all duration-300`}>
                                {isPast ? "Taken" : med.status === "current" ? "Next Dose" : "Upcoming"}
                              </h3>
                              
                              <div className="text-center">
                                <p className={`${isMainCard ? "text-xl" : "text-lg"} font-medium ${isMainCard ? "text-primary" : isPast ? "text-green-700" : "text-blue-700"} transition-all duration-300`}>
                                  {med.name}
                                </p>
                                <p className={`${isMainCard ? "text-lg" : "text-sm"} text-muted-foreground transition-all duration-300`}>
                                  {med.time}
                                </p>
                                <p className={`${isMainCard ? "text-lg" : "text-sm"} text-muted-foreground transition-all duration-300`}>
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
                                    <CheckCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                    Mark as Taken
                                  </span>
                                </Button>
                              )}
                            </div>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
