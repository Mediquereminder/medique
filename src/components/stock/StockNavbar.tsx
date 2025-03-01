
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface StockNavbarProps {
  onLogout: () => void;
}

export const StockNavbar = ({ onLogout }: StockNavbarProps) => {
  return (
    <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/a1995604-78a6-42f0-a09f-3066fbff9ff7.png" 
            alt="Medique Logo" 
            className="h-8 w-auto ml-12"
          />
          <div className="text-2xl font-semibold text-primary">Medique</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-primary hover:bg-primary/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SidebarTrigger>
    </nav>
  );
};
