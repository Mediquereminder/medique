
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
import { Home, Package, UserCircle, Users, History } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

interface AppSidebarProps {
  role: "admin" | "patient";
}

export function AppSidebar({ role }: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = role === "admin" ? "/admin-dashboard" : "/dashboard";

  // Force the correct home path based on role
  const goHome = () => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

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
                    onClick={goHome}
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

              {role === "admin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:text-primary hover:bg-primary/10"
                      onClick={() => navigate(`${basePath}/patients`)}
                    >
                      <Users className="h-4 w-4" />
                      <span>Patients</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {role === "patient" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:text-primary hover:bg-primary/10"
                      onClick={() => navigate(`${basePath}/history`)}
                    >
                      <History className="h-4 w-4" />
                      <span>History</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

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
