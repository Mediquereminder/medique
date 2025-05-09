
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { Bell, BellRing } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/hooks/use-toast";
import { checkDueMedications, checkMissedMedications } from "@/utils/medicationService";

interface StockNavbarProps {
  onLogout: () => void;
}

export function StockNavbar({
  onLogout
}: StockNavbarProps) {
  const { toast: toastHook } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    // Get all users to find notifications
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((user: any) => user.userId === currentUser.userId);
    
    if (userIndex !== -1) {
      const userNotifications = users[userIndex].notifications || [];
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter((notification: any) => !notification.read).length);
    }

    // Check for due and missed medications
    if (currentUser.userId) {
      checkDueMedications();
      checkMissedMedications();
    }

    // Set up interval to check for new notifications and medications
    const interval = setInterval(() => {
      const updatedUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUserIndex = updatedUsers.findIndex((user: any) => user.userId === currentUser.userId);
      
      if (updatedUserIndex !== -1) {
        const updatedNotifications = updatedUsers[updatedUserIndex].notifications || [];
        
        // Check if there are new notifications
        if (updatedNotifications.length > notifications.length) {
          const newNotifs = updatedNotifications.slice(0, updatedNotifications.length - notifications.length);
          
          // Show a toast for new notifications
          if (newNotifs.length > 0) {
            toast({
              title: newNotifs[0].title,
              description: newNotifs[0].message,
            });
          }
        }
        
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter((notification: any) => !notification.read).length);
      }
      
      // Check for due and missed medications
      if (currentUser.userId) {
        checkDueMedications();
        checkMissedMedications();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [notifications.length]);

  const markAllAsRead = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((user: any) => user.userId === currentUser.userId);
    
    if (userIndex !== -1) {
      // Mark all notifications as read
      users[userIndex].notifications = notifications.map((notification: any) => ({
        ...notification,
        read: true
      }));
      
      // Update local storage
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));
      
      // Update state
      setNotifications(users[userIndex].notifications);
      setUnreadCount(0);
      
      toastHook({
        title: "Notifications cleared",
        description: "All notifications have been marked as read."
      });
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return <header className="h-[73px] fixed top-0 left-0 w-full bg-white border-b z-10 px-4 md:px-6">
      <div className="flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          <div className="font-semibold">Medique</div>
        </div>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                {unreadCount > 0 ? (
                  <>
                    <BellRing className="h-5 w-5" />
                    <Badge 
                      className="absolute -top-2 -right-2 px-2 py-1 min-w-5 min-h-5 flex items-center justify-center"
                      variant="destructive"
                    >
                      {unreadCount}
                    </Badge>
                  </>
                ) : (
                  <Bell className="h-5 w-5" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white shadow-lg border p-0" align="end">
              <div className="flex justify-between items-center p-3 border-b">
                <h3 className="font-medium">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No notifications</p>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((notification, index) => (
                      <div 
                        key={index} 
                        className={cn(
                          "p-3 border-b last:border-b-0",
                          notification.read ? "bg-white" : "bg-primary/5 border-l-2 border-primary"
                        )}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatNotificationTime(notification.timestamp)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>;
}
