
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, CheckCircle, Timer } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { ThreeDPhotoCarousel } from "@/components/ui/3d-carousel";

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
  const [clickedMedId, setClickedMedId] = useState(null);

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
    
    // After a brief delay to allow animation to complete
    setTimeout(() => {
      // Update medications list
      const updatedMedications = medications.map(med => 
        med.id === id ? { ...med, status: "taken", time: "Just now" } : med
      );
      
      setMedications(updatedMedications);
      
      // Reset animation states
      setClickedMedId(null);
    }, 600); // Slightly longer to match animation duration
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  // Current medication to display prominently
  const currentMedication = medications.find(med => med.status === "current");

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
                
                {/* 3D Carousel Implementation */}
                <div className="w-full max-w-4xl mb-8">
                  <ThreeDPhotoCarousel />
                </div>
                
                {/* Current Medication Card */}
                {currentMedication && (
                  <div className="w-full max-w-md mb-8 animate-fadeIn" style={{ animationDelay: "300ms" }}>
                    <Card
                      className={`
                        p-6 relative overflow-hidden border-0
                        bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl border-l-4 border-l-primary
                        ${clickedMedId === currentMedication.id ? 'pulse-once scale-105' : ''}
                        transition-all duration-500 ease-in-out
                        hover:shadow-2xl hover:-translate-y-2 hover:scale-105
                        before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r 
                        before:from-transparent before:via-white/10 before:to-transparent 
                        before:translate-x-[-100%] before:skew-x-[-20deg] before:animate-shimmer
                      `}
                      style={{
                        boxShadow: "0 10px 25px -5px rgba(79, 209, 197, 0.3)"
                      }}
                    >
                      <div className="flex flex-col items-center gap-4 relative z-10">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping"></div>
                          <Timer className="w-16 h-16 text-primary relative z-10" />
                        </div>
                        
                        <h3 className="text-2xl font-bold transition-all duration-300">
                          Next Dose
                        </h3>
                        
                        <div className="text-center">
                          <p className="text-xl font-medium text-primary transition-all duration-300">
                            {currentMedication.name}
                          </p>
                          <p className="text-lg text-muted-foreground transition-all duration-300">
                            {currentMedication.time}
                          </p>
                          <p className="text-lg text-muted-foreground transition-all duration-300">
                            {currentMedication.dosage}
                          </p>
                        </div>
                        
                        <Button 
                          className="mt-4 w-full group relative overflow-hidden"
                          onClick={() => handleMarkAsTaken(currentMedication.id)}
                        >
                          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-green-500 transition-transform duration-300 transform translate-y-full group-hover:translate-y-0"></span>
                          <span className="relative flex items-center justify-center gap-2 transition-all duration-300 group-hover:text-white">
                            <CheckCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                            Mark as Taken
                          </span>
                        </Button>
                      </div>
                    </Card>
                  </div>
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
