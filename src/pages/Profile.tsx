
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockNavbar } from "@/components/stock/StockNavbar";
import { useToast } from "@/hooks/use-toast";
import { UserRound, Copy, CheckCircle2, UserPlus, Users } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) {
      navigate("/login");
      return;
    }

    setUser(currentUser);
    setName(currentUser.name || "");
    setEmail(currentUser.email || "");
    setRole(currentUser.role || "patient");

    // Generate unique code for patients if it doesn't exist
    if (currentUser.role === "patient" && !currentUser.uniqueCode) {
      const newUniqueCode = uuidv4().substring(0, 8);
      
      // Update current user
      currentUser.uniqueCode = newUniqueCode;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex((u: any) => u.userId === currentUser.userId);
      if (userIndex !== -1) {
        users[userIndex].uniqueCode = newUniqueCode;
        localStorage.setItem("users", JSON.stringify(users));
      }
      
      setUniqueCode(newUniqueCode);
    } else {
      setUniqueCode(currentUser.uniqueCode || "");
    }

    // Load connected users
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    if (currentUser.role === "patient") {
      // Get caretakers
      const connectedCaretakers = (currentUser.connectedCaretakers || []).map((caretakerId: string) => {
        const caretaker = allUsers.find((u: any) => u.userId === caretakerId);
        return caretaker ? { id: caretaker.userId, name: caretaker.name, email: caretaker.email, role: "Caretaker" } : null;
      }).filter(Boolean);
      
      setConnectedUsers(connectedCaretakers);
    } else {
      // Get patients
      const connectedPatients = (currentUser.connectedPatients || []).map((patientId: string) => {
        const patient = allUsers.find((u: any) => u.userId === patientId);
        return patient ? { id: patient.userId, name: patient.name, email: patient.email, role: "Patient" } : null;
      }).filter(Boolean);
      
      setConnectedUsers(connectedPatients);
    }
  }, [navigate]);

  const handleUpdateProfile = () => {
    if (!name || !email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name and email are required.",
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const userIndex = users.findIndex((u: any) => u.userId === user.userId);

    if (userIndex !== -1) {
      users[userIndex].name = name;
      users[userIndex].email = email;

      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(uniqueCode);
    setCopied(true);
    
    toast({
      title: "Code copied",
      description: "Unique code copied to clipboard.",
    });
    
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role={role as "admin" | "patient"} />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserRound className="w-12 h-12 text-primary" />
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={role === "admin" ? "Caretaker" : "Patient"}
                            readOnly
                            disabled
                          />
                        </div>
                        
                        {role === "patient" && (
                          <div className="space-y-2">
                            <Label htmlFor="uniqueCode">Your Unique Code</Label>
                            <div className="flex">
                              <Input
                                id="uniqueCode"
                                value={uniqueCode}
                                readOnly
                                className="font-mono tracking-wider"
                              />
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="ml-2"
                                onClick={copyCodeToClipboard}
                              >
                                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Share this code with your caretaker to connect your account.
                            </p>
                          </div>
                        )}
                        
                        <Button onClick={handleUpdateProfile} className="w-full">
                          Update Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {role === "patient" ? "Connected Caretakers" : "Connected Patients"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {connectedUsers.length > 0 ? (
                      <div className="space-y-4">
                        {connectedUsers.map((connected) => (
                          <div 
                            key={connected.id} 
                            className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <UserRound className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{connected.name}</p>
                              <p className="text-sm text-muted-foreground">{connected.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">
                          {role === "patient" ? "No connected caretakers" : "No connected patients"}
                        </p>
                        {role === "admin" && (
                          <Button 
                            variant="outline" 
                            onClick={() => navigate("/admin-dashboard/patients")} 
                            className="mt-4"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Connect Patients
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
