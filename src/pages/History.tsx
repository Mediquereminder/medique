
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockNavbar } from "@/components/stock/StockNavbar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface HistoryEntry {
  id: string;
  action: string;
  date: string;
  medicine: string;
  quantity: string;
  patientId: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
}

const dummyHistory: HistoryEntry[] = [
  {
    id: "1",
    action: "Added",
    date: "2024-03-15",
    medicine: "Aspirin",
    quantity: "+50",
    patientId: "p1",
  },
  {
    id: "2",
    action: "Taken",
    date: "2024-03-14",
    medicine: "Vitamin C",
    quantity: "-2",
    patientId: "p1",
  },
  {
    id: "3",
    action: "Added",
    date: "2024-03-13",
    medicine: "Paracetamol",
    quantity: "+25",
    patientId: "p2",
  },
];

const initialPatients: Patient[] = [
  { id: "p1", name: "John Doe", email: "john@example.com" },
  { id: "p2", name: "Jane Smith", email: "jane@example.com" },
];

const History = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "patient">("patient");
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const savedHistory = localStorage.getItem("medicationHistory");
    return savedHistory ? JSON.parse(savedHistory) : dummyHistory;
  });
  
  const [patients, setPatients] = useState<Patient[]>(() => {
    const savedPatients = localStorage.getItem("patients");
    return savedPatients ? JSON.parse(savedPatients) : initialPatients;
  });
  
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    setUserRole(user.role || "patient");
    
    // If user is a patient, filter history by their ID
    if (user.role === "patient" && user.id) {
      setSelectedPatientId(user.id);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const filteredHistory = history.filter(entry => 
    !selectedPatientId || entry.patientId === selectedPatientId
  );

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role={userRole} />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Medication History</CardTitle>
                </CardHeader>
                <CardContent>
                  {userRole === "admin" && (
                    <div className="mb-6">
                      <Label htmlFor="patient-select" className="mb-2 block">Select Patient</Label>
                      <Select 
                        value={selectedPatientId} 
                        onValueChange={setSelectedPatientId}
                      >
                        <SelectTrigger className="w-full sm:w-[250px]">
                          <SelectValue placeholder="All Patients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Patients</SelectItem>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {userRole === "admin" && selectedPatientId === "" && (
                            <TableHead>Patient</TableHead>
                          )}
                          <TableHead>Medicine</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Quantity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistory.length > 0 ? (
                          filteredHistory.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>{entry.date}</TableCell>
                              {userRole === "admin" && selectedPatientId === "" && (
                                <TableCell>
                                  {patients.find(p => p.id === entry.patientId)?.name || "Unknown"}
                                </TableCell>
                              )}
                              <TableCell>{entry.medicine}</TableCell>
                              <TableCell>{entry.action}</TableCell>
                              <TableCell 
                                className={
                                  entry.quantity.startsWith("+") 
                                    ? "text-green-600" 
                                    : "text-red-600"
                                }
                              >
                                {entry.quantity}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={userRole === "admin" && selectedPatientId === "" ? 5 : 4} className="h-24 text-center">
                              No history entries found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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

export default History;
