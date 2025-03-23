
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
import { 
  UserPlus, 
  UserX, 
  UserRound, 
  Users, 
  Search, 
  Loader2,
  X,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { addNotification } from "@/utils/medicationService";

interface Patient {
  userId: string;
  name: string;
  email: string;
  uniqueCode?: string;
}

const AdminPatients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>({});
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [patientCode, setPatientCode] = useState("");
  const [isLoadingConnection, setIsLoadingConnection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email || user.role !== "admin") {
      navigate("/login");
      return;
    }
    
    setCurrentUser(user);
    
    // Load patients connected to this caretaker
    loadPatients(user);
  }, [navigate]);
  
  const loadPatients = (user: any) => {
    const allUsers = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Get connected patients for this caretaker - ensure array exists and filter out duplicates
    const connectedPatientIds = [...new Set(user.connectedPatients || [])];
    
    // Filter for only connected patients
    const patientList = allUsers
      .filter((u: any) => 
        u.role === "patient" && connectedPatientIds.includes(u.userId)
      )
      .map((u: any) => ({
        userId: u.userId,
        name: u.name,
        email: u.email,
        uniqueCode: u.uniqueCode
      }));
    
    setPatients(patientList);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleConnectPatient = () => {
    if (!patientCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a patient code.",
      });
      return;
    }
    
    setIsLoadingConnection(true);
    
    // Simulate network delay
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const patientIndex = users.findIndex((u: any) => 
        u.role === "patient" && u.uniqueCode === patientCode
      );
      
      if (patientIndex === -1) {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "No patient found with this code.",
        });
        setIsLoadingConnection(false);
        return;
      }
      
      const patient = users[patientIndex];
      
      // Check if already connected
      if (currentUser.connectedPatients?.includes(patient.userId)) {
        toast({
          variant: "destructive",
          title: "Already Connected",
          description: "You're already connected to this patient.",
        });
        setIsLoadingConnection(false);
        return;
      }
      
      // Update caretaker's connected patients - ensure it's an array and add unique value
      const caretakerIndex = users.findIndex((u: any) => u.userId === currentUser.userId);
      if (caretakerIndex !== -1) {
        const currentConnections = users[caretakerIndex].connectedPatients || [];
        // Only add if not already connected
        if (!currentConnections.includes(patient.userId)) {
          users[caretakerIndex].connectedPatients = [...currentConnections, patient.userId];
        }
        
        // Update the current user state
        setCurrentUser(users[caretakerIndex]);
        
        // Add notification for caretaker
        addNotification(currentUser.userId, {
          title: "Patient Connected",
          message: `You are now connected to ${patient.name} as their caretaker.`,
          timestamp: new Date().toISOString(),
          type: "connection",
          read: false
        });
      }
      
      // Update patient's connected caretakers - ensure it's an array and add unique value
      const currentPatientCaretakers = users[patientIndex].connectedCaretakers || [];
      if (!currentPatientCaretakers.includes(currentUser.userId)) {
        users[patientIndex].connectedCaretakers = [...currentPatientCaretakers, currentUser.userId];
      }
      
      // Add notification for patient
      addNotification(patient.userId, {
        title: "New Caretaker Connected",
        message: `${currentUser.name} is now your caretaker and can manage your medications.`,
        timestamp: new Date().toISOString(),
        type: "connection",
        read: false
      });
      
      // Save updated users
      localStorage.setItem("users", JSON.stringify(users));
      
      // Update the current user in localStorage
      localStorage.setItem("currentUser", JSON.stringify(users[caretakerIndex]));
      
      // Refresh patient list
      loadPatients(users[caretakerIndex]);
      
      // Clear input and close dialog
      setPatientCode("");
      setIsConnecting(false);
      setIsLoadingConnection(false);
      
      toast({
        title: "Connection Successful",
        description: `You are now connected to ${patient.name}.`,
      });
    }, 1500);
  };

  const handleDisconnectPatient = (patientId: string) => {
    const patientToDisconnect = patients.find(p => p.userId === patientId);
    if (!patientToDisconnect) return;
    
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    
    // Update caretaker's connected patients
    const caretakerIndex = users.findIndex((u: any) => u.userId === currentUser.userId);
    if (caretakerIndex !== -1) {
      users[caretakerIndex].connectedPatients = users[caretakerIndex].connectedPatients.filter(
        (id: string) => id !== patientId
      );
      
      // Update the current user state
      setCurrentUser(users[caretakerIndex]);
    }
    
    // Update patient's connected caretakers
    const patientIndex = users.findIndex((u: any) => u.userId === patientId);
    if (patientIndex !== -1) {
      users[patientIndex].connectedCaretakers = users[patientIndex].connectedCaretakers.filter(
        (id: string) => id !== currentUser.userId
      );
      
      // Add notification for patient
      addNotification(patientId, {
        title: "Caretaker Disconnected",
        message: `${currentUser.name} is no longer your caretaker.`,
        timestamp: new Date().toISOString(),
        type: "connection",
        read: false
      });
    }
    
    // Save updated users
    localStorage.setItem("users", JSON.stringify(users));
    
    // Update the current user in localStorage
    localStorage.setItem("currentUser", JSON.stringify(users[caretakerIndex]));
    
    // Refresh patient list
    loadPatients(users[caretakerIndex]);
    
    toast({
      title: "Patient Disconnected",
      description: `You are no longer connected to ${patientToDisconnect.name}.`,
    });
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleManagePatient = (patientId: string) => {
    // Save the selected patient ID to localStorage for use on stock page
    localStorage.setItem("selectedPatientId", patientId);
    
    // Navigate to stock page where caretaker can manage medications
    navigate("/admin-dashboard/stock");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                  <p className="text-muted-foreground">Connect and manage your patients</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      className="pl-9 w-full md:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button 
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <Dialog open={isConnecting} onOpenChange={setIsConnecting}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Connect Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect to a Patient</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="patient-code">Patient Code</Label>
                          <Input
                            id="patient-code"
                            placeholder="Enter patient's unique code"
                            value={patientCode}
                            onChange={(e) => setPatientCode(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            Ask your patient for their unique code found in their profile.
                          </p>
                        </div>
                        
                        <Button 
                          onClick={handleConnectPatient} 
                          disabled={isLoadingConnection}
                          className="mt-2"
                        >
                          {isLoadingConnection ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {patients.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent className="pt-6">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">No patients yet</h2>
                    <p className="text-muted-foreground mt-2 mb-6">
                      Connect with patients to help manage their medications
                    </p>
                    <Button onClick={() => setIsConnecting(true)}>
                      Connect Your First Patient
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPatients.map((patient) => (
                    <Card key={patient.userId} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex justify-between items-center">
                        <h3 className="font-semibold text-lg text-primary">{patient.name}</h3>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <UserRound className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => handleManagePatient(patient.userId)}
                          >
                            Manage Medications
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDisconnectPatient(patient.userId)}
                          >
                            <UserX className="mr-1 h-4 w-4" />
                            Disconnect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {patients.length > 0 && filteredPatients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-lg font-medium text-gray-700">No patients match your search</p>
                  <p className="text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPatients;
