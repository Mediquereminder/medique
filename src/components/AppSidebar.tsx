
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Package, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface AppSidebarProps {
  role: "admin" | "patient";
}

export function AppSidebar({ role }: AppSidebarProps) {
  const navigate = useNavigate();
  const basePath = role === "admin" ? "/admin-dashboard" : "/dashboard";

  return (
    <Sidebar className="top-[73px] border-t">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:text-primary hover:bg-primary/10" 
                    onClick={() => navigate(basePath)}
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:text-primary hover:bg-primary/10"
                    onClick={() => navigate(`${basePath}/stock`)}
                  >
                    <Package className="h-4 w-4" />
                    <span>Stock</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start hover:text-primary hover:bg-primary/10"
                    onClick={() => navigate(`${basePath}/profile`)}
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Profile</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
