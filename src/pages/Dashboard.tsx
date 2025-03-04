
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, ArrowLeft, ArrowRight } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MedicationCarousel } from "@/components/MedicationCarousel";

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
    status: "taken" as const,
  },
  {
    id: 2,
    name: "Vitamin C",
    time: "1 hour ago",
    dosage: "2 tablets",
    status: "taken" as const,
  },
  {
    id: 3,
    name: "Paracetamol",
    time: "In 30 minutes",
    dosage: "2 tablets",
    status: "current" as const,
  },
  {
    id: 4,
    name: "Vitamin D",
    time: "In 3 hours",
    dosage: "1 capsule",
    status: "upcoming" as const,
  },
  {
    id: 5,
    name: "Iron Supplement",
    time: "In 5 hours",
    dosage: "1 tablet",
    status: "upcoming" as const,
  },
  {
    id: 6,
    name: "Omega-3",
    time: "In 8 hours",
    dosage: "2 capsules",
    status: "upcoming" as const,
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [randomFact, setRandomFact] = useState("");
  const [medications, setMedications] = useState(initialMedications);
  const [timelinePosition, setTimelinePosition] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [clickedMedId, setClickedMedId] = useState<number | null>(null);

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

  const handleMarkAsTaken = (id: number) => {
    // Set the clicked medication ID for targeted animation
    setClickedMedId(id);
    
    // Set animating state to trigger the shift animation
    setAnimating(true);
    
    // After a brief delay to allow animation to complete
    setTimeout(() => {
      // Update medications list
      const updatedMedications = medications.map(med => 
        med.id === id ? { ...med, status: "taken" as const, time: "Just now" } : med
      );
      
      // Move timeline position to the right
      setTimelinePosition(prev => prev + 1);
      setMedications(updatedMedications);
      
      // Reset animation states
      setAnimating(false);
      setClickedMedId(null);
    }, 600); // Slightly longer to match animation duration
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar role="patient" />
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
                    Showing {timelinePosition + 1} of {Math.max(1, medications.length - 2)}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTimelinePosition(Math.min(medications.length - 3, timelinePosition + 1))}
                    disabled={timelinePosition >= medications.length - 3 || animating}
                    className="flex gap-2 items-center transition-all hover:bg-primary/10 hover:text-primary hover:scale-105"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* 3D Medication Carousel */}
                <MedicationCarousel 
                  medications={medications}
                  timelinePosition={timelinePosition}
                  onMarkAsTaken={handleMarkAsTaken}
                  animating={animating}
                  clickedMedId={clickedMedId}
                />

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
