
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface StockNavbarProps {
  onLogout: () => void;
}

export function StockNavbar({ onLogout }: StockNavbarProps) {
  return (
    <header className="h-[73px] fixed top-0 left-0 w-full bg-white border-b z-10 px-4 md:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          <div className="font-semibold">MediTrack</div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onLogout}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
