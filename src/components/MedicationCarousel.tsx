
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Timer, Clock } from "lucide-react";
import { 
  motion, 
  useAnimation, 
  useMotionValue, 
  useTransform, 
  AnimatePresence 
} from "framer-motion";

interface Medication {
  id: number;
  name: string;
  time: string;
  dosage: string;
  status: "taken" | "current" | "upcoming";
}

interface MedicationCarouselProps {
  medications: Medication[];
  timelinePosition: number;
  onMarkAsTaken: (id: number) => void;
  animating: boolean;
  clickedMedId: number | null;
}

export const MedicationCarousel = ({
  medications,
  timelinePosition,
  onMarkAsTaken,
  animating,
  clickedMedId
}: MedicationCarouselProps) => {
  const controls = useAnimation();
  const [isCarouselActive] = useState(true);
  
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

  const timelineMeds = getTimelineMedications();
  
  // 3D carousel setup
  const cylinderWidth = 1200;
  const faceCount = timelineMeds.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);
  const transform = useTransform(
    rotation,
    (value) => `rotate3d(0, 1, 0, ${value}deg)`
  );

  return (
    <div className="w-full max-w-5xl mx-auto relative overflow-hidden py-12 rounded-xl">
      <div
        className="flex h-[400px] items-center justify-center"
        style={{
          perspective: "1500px",
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) =>
            isCarouselActive &&
            rotation.set(rotation.get() + info.offset.x * 0.05)
          }
          onDragEnd={(_, info) =>
            isCarouselActive &&
            controls.start({
              rotateY: rotation.get() + info.velocity.x * 0.05,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 30,
                mass: 0.1,
              },
            })
          }
          animate={controls}
          className={`
            transition-all duration-600 ease-in-out
            ${animating ? 'transform -translate-x-[calc(100%/3+1rem)]' : ''}
          `}
        >
          {timelineMeds.map((med, i) => (
            <motion.div
              key={`key-${med.id}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
                transformStyle: "preserve-3d",
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className={`
                  p-6 flex-shrink-0 relative overflow-hidden border-0 w-full h-[300px]
                  ${
                    med.status === "taken"
                      ? "bg-card/90 border-l-4 border-l-green-500" 
                      : med.status === "current"
                      ? "bg-gradient-to-br from-primary/10 to-secondary/10 shadow-xl border-l-4 border-l-primary"
                      : "bg-card/90 border-l-4 border-l-blue-400" 
                  }
                  ${clickedMedId === med.id ? 'pulse-once scale-105' : ''}
                  transition-all duration-500 ease-in-out
                  hover:shadow-2xl 
                  before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r 
                  before:from-transparent before:via-white/10 before:to-transparent 
                  before:translate-x-[-100%] before:skew-x-[-20deg] before:animate-shimmer
                  rounded-xl
                `}
                style={{
                  boxShadow: med.status === "current" 
                    ? "0 10px 25px -5px rgba(79, 209, 197, 0.3)" 
                    : "",
                  backfaceVisibility: "hidden",
                }}
                layoutId={`med-card-${med.id}`}
              >
                <div className="flex flex-col items-center gap-4 relative z-10">
                  {med.status === "taken" && 
                    <CheckCircle className="w-12 h-12 text-green-500 animate-fadeIn" />
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
                      onClick={() => onMarkAsTaken(med.id)}
                    >
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-green-500 transition-transform duration-300 transform translate-y-full group-hover:translate-y-0"></span>
                      <span className="relative flex items-center justify-center gap-2 transition-all duration-300 group-hover:text-white">
                        <CheckCircle className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                        Mark as Taken
                      </span>
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
