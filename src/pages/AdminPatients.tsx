
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StockNavbar } from "@/components/stock/StockNavbar";
import { useToast } from "@/hooks/use-toast";
import { UserRound, UserPlus, Check, Search, UserX, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { addNotification } from "@/utils/medicationService";

interface Patient {
  userId: string;
  name: string;
  email: string;
  uniqueCode?: string;
  connected: boolean;
}

const AdminPatients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [patientCode, setPatientCode] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }

    // Load all patients
    loadConnectedPatients(currentUser);
  }, [navigate]);

  const loadConnectedPatients = (currentUser: any) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    const connectedPatientIds = currentUser.connectedPatients || [];
    
    // Get all patients
    const patientsList = allUsers
      .filter((user: any) => user.role === "patient")
      .map((user: any) => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        uniqueCode: user.uniqueCode,
        connected: connectedPatientIds.includes(user.userId)
      }));
    
    setPatients(patientsList);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConnectPatient = () => {
    if (!patientCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a patient code.",
      });
      return;
    }
    
    setIsConnecting(true);
    
    setTimeout(() => {
      // Find patient with the given code
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const patientIndex = users.findIndex((user: any) => 
        user.role === "patient" && user.uniqueCode === patientCode
      );
      
      if (patientIndex === -1) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid patient code.",
        });
        setIsConnecting(false);
        return;
      }
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      // Check if already connected
      if (currentUser.connectedPatients && currentUser.connectedPatients.includes(users[patientIndex].userId)) {
        toast({
          variant: "destructive",
          title: "Already connected",
          description: "You are already connected to this patient.",
        });
        setIsConnecting(false);
        return;
      }
      
      // Connect caretaker to patient
      if (!users[patientIndex].connectedCaretakers) {
        users[patientIndex].connectedCaretakers = [];
      }
      users[patientIndex].connectedCaretakers.push(currentUser.userId);
      
      // Connect patient to caretaker
      const caretakerIndex = users.findIndex((user: any) => user.userId === currentUser.userId);
      if (caretakerIndex !== -1) {
        if (!users[caretakerIndex].connectedPatients) {
          users[caretakerIndex].connectedPatients = [];
        }
        users[caretakerIndex].connectedPatients.push(users[patientIndex].userId);
        
        // Update current user
        currentUser.connectedPatients = users[caretakerIndex].connectedPatients;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
      
      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      // Notify the patient
      addNotification(users[patientIndex].userId, {
        title: "New Caretaker Connected",
        message: `${currentUser.name} is now your caretaker.`,
        timestamp: new Date().toISOString(),
        type: "connection",
        read: false
      });
      
      toast({
        title: "Patient connected!",
        description: `You are now connected to ${users[patientIndex].name}.`,
      });
      
      // Reload the list
      loadConnectedPatients(currentUser);
      
      setIsConnecting(false);
      setDialogOpen(false);
      setPatientCode("");
    }, 1000);
  };

  const handleDisconnect = (patientId: string) => {
    // Find the patient and current user
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    // Find the patient
    const patientIndex = users.findIndex((user: any) => user.userId === patientId);
    if (patientIndex === -1) return;
    
    // Remove caretaker from patient's connected caretakers
    if (users[patientIndex].connectedCaretakers) {
      users[patientIndex].connectedCaretakers = users[patientIndex].connectedCaretakers
        .filter((id: string) => id !== currentUser.userId);
    }
    
    // Remove patient from caretaker's connected patients
    const caretakerIndex = users.findIndex((user: any) => user.userId === currentUser.userId);
    if (caretakerIndex !== -1 && users[caretakerIndex].connectedPatients) {
      users[caretakerIndex].connectedPatients = users[caretakerIndex].connectedPatients
        .filter((id: string) => id !== patientId);
      
      // Update current user
      currentUser.connectedPatients = users[caretakerIndex].connectedPatients;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    }
    
    // Update users in localStorage
    localStorage.setItem("users", JSON.stringify(users));
    
    // Notify the patient
    addNotification(patientId, {
      title: "Caretaker Disconnected",
      message: `${currentUser.name} is no longer your caretaker.`,
      timestamp: new Date().toISOString(),
      type: "connection",
      read: false
    });
    
    toast({
      title: "Patient disconnected",
      description: `You are no longer connected to ${users[patientIndex].name}.`,
    });
    
    // Reload the list
    loadConnectedPatients(currentUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <CardTitle>Manage Patients</CardTitle>
                      <CardDescription>
                        Connect with your patients using their unique codes
                      </CardDescription>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="mt-3 sm:mt-0">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Connect New Patient
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect to a Patient</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="patient-code">Enter Patient Code</Label>
                            <Input
                              id="patient-code"
                              placeholder="Enter 6-character code"
                              className="uppercase"
                              value={patientCode}
                              onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                              maxLength={6}
                            />
                            <p className="text-sm text-muted-foreground">
                              Ask your patient for their unique code from their profile.
                            </p>
                          </div>
                          <Button 
                            className="w-full"
                            onClick={handleConnectPatient}
                            disabled={isConnecting}
                          >
                            {isConnecting ? "Connecting..." : "Connect to Patient"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        placeholder="Search patients by name or email"
                        className="pl-10"
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                    
                    {filteredPatients.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patient</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredPatients.map((patient) => (
                              <TableRow key={patient.userId}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <UserRound className="h-4 w-4 text-primary" />
                                    </div>
                                    {patient.name}
                                  </div>
                                </TableCell>
                                <TableCell>{patient.email}</TableCell>
                                <TableCell>
                                  {patient.connected ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      <Check className="mr-1 h-3 w-3" />
                                      Connected
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                      Not Connected
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {patient.connected ? (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDisconnect(patient.userId)}
                                    >
                                      <UserX className="mr-1 h-4 w-4" />
                                      Disconnect
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                      onClick={() => {
                                        setDialogOpen(true);
                                        if (patient.uniqueCode) {
                                          setPatientCode(patient.uniqueCode);
                                        }
                                      }}
                                    >
                                      <UserPlus className="mr-1 h-4 w-4" />
                                      Connect
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No patients found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm ? "Try a different search term" : "There are no patients in the system yet"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPatients;
