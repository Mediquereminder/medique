
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  message?: string;
  visible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = "Processing your request...", 
  visible 
}) => {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
