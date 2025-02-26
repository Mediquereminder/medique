
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Menu, UserPlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Patient {
  userId: string;
  name: string;
  email: string;
}

const AdminPatients = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newPatientId, setNewPatientId] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    // Check if user is logged in and is admin
    if (!currentUser.email || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }

    // Load connected patients
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const connectedPatients = (currentUser.connectedPatients || [])
      .map((patientId: string) => {
        return users.find((user: any) => user.userId === patientId && user.role === "patient");
      })
      .filter(Boolean); // Remove any undefined values

    setPatients(connectedPatients);
  }, [navigate]);

  const handleAddPatient = () => {
    if (!newPatientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Patient ID",
        variant: "destructive",
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    // Find the patient
    const patient = users.find((user: any) => user.userId === newPatientId && user.role === "patient");
    
    if (!patient) {
      toast({
        title: "Error",
        description: "Patient not found. Please check the ID and try again.",
        variant: "destructive",
      });
      return;
    }

    // Check if patient is already connected
    if (currentUser.connectedPatients?.includes(newPatientId)) {
      toast({
        title: "Error",
        description: "This patient is already connected to your account.",
        variant: "destructive",
      });
      return;
    }

    // Update the caretaker's connected patients
    const updatedUsers = users.map((user: any) => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          connectedPatients: [...(user.connectedPatients || []), newPatientId]
        };
      }
      if (user.userId === newPatientId) {
        return {
          ...user,
          connectedCaretakers: [...(user.connectedCaretakers || []), currentUser.userId]
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Update current user in localStorage
    const updatedCurrentUser = {
      ...currentUser,
      connectedPatients: [...(currentUser.connectedPatients || []), newPatientId]
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    // Update the patients list in state
    setPatients([...patients, patient]);

    toast({
      title: "Success",
      description: "Patient connected successfully!",
    });

    setNewPatientId("");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 h-[73px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SidebarTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SidebarTrigger>
                <h1 className="text-xl font-semibold">Patients</h1>
              </div>
            </div>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add New Patient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter Patient ID"
                      value={newPatientId}
                      onChange={(e) => setNewPatientId(e.target.value)}
                    />
                    <Button onClick={handleAddPatient}>
                      Connect Patient
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {patients.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex items-center justify-center p-6">
                      <div className="text-center text-muted-foreground">
                        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                        <p>No patients connected yet.</p>
                        <p className="text-sm">Add patients using their unique ID above.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  patients.map((patient) => (
                    <Card key={patient.userId}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{patient.name}</h3>
                            <p className="text-sm text-muted-foreground">{patient.email}</p>
                            <p className="text-xs text-muted-foreground mt-1">ID: {patient.userId}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin-dashboard/patients/${patient.userId}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminPatients;
