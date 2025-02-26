import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, AlertCircle, UserX } from "lucide-react";
import { StockNavbar } from "@/components/stock/StockNavbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null);

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
      .filter(Boolean);

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

  const handleRemovePatient = () => {
    if (!patientToRemove) return;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    // Remove patient from caretaker's connected patients
    const updatedUsers = users.map((user: any) => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          connectedPatients: (user.connectedPatients || []).filter(
            (id: string) => id !== patientToRemove.userId
          ),
        };
      }
      if (user.userId === patientToRemove.userId) {
        return {
          ...user,
          connectedCaretakers: (user.connectedCaretakers || []).filter(
            (id: string) => id !== currentUser.userId
          ),
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Update current user in localStorage
    const updatedCurrentUser = {
      ...currentUser,
      connectedPatients: (currentUser.connectedPatients || []).filter(
        (id: string) => id !== patientToRemove.userId
      ),
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    // Update the patients list in state
    setPatients(patients.filter((p) => p.userId !== patientToRemove.userId));

    toast({
      title: "Success",
      description: "Patient removed successfully",
    });

    setPatientToRemove(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />

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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/admin-dashboard/patients/${patient.userId}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setPatientToRemove(patient)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          </div>
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

      <Dialog open={!!patientToRemove} onOpenChange={() => setPatientToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {patientToRemove?.name} from your connected patients? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemovePatient}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AdminPatients;
