
import { useEffect, useState, Fragment } from "react";
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
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryEntry {
  id: string;
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

// Group medications by date for the sublist view
interface GroupedHistory {
  date: string;
  entries: HistoryEntry[];
  patientId: string;
  isExpanded?: boolean;
}

const dummyHistory: HistoryEntry[] = [
  {
    id: "1",
    date: "2024-03-15",
    medicine: "Aspirin",
    quantity: "1",
    patientId: "p1",
  },
  {
    id: "2",
    date: "2024-03-15",
    medicine: "Vitamin C",
    quantity: "2",
    patientId: "p1",
  },
  {
    id: "3",
    date: "2024-03-13",
    medicine: "Paracetamol",
    quantity: "1",
    patientId: "p2",
  },
  {
    id: "4",
    date: "2024-03-15",
    medicine: "Ibuprofen",
    quantity: "1",
    patientId: "p1",
  },
  {
    id: "5",
    date: "2024-03-14",
    medicine: "Vitamin D",
    quantity: "1",
    patientId: "p1",
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
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory[]>([]);

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

  useEffect(() => {
    // Filter history based on selected patient
    const filteredHistory = history.filter(entry => 
      !selectedPatientId || entry.patientId === selectedPatientId
    );
    
    // Group history entries by date
    const grouped = filteredHistory.reduce<GroupedHistory[]>((acc, entry) => {
      const existingGroup = acc.find(group => group.date === entry.date);
      if (existingGroup) {
        existingGroup.entries.push(entry);
      } else {
        acc.push({ 
          date: entry.date, 
          entries: [entry], 
          patientId: entry.patientId,
          isExpanded: true // Default to expanded
        });
      }
      return acc;
    }, []);
    
    // Sort groups by date (newest first)
    const sortedGroups = grouped.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setGroupedHistory(sortedGroups);
  }, [history, selectedPatientId]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const toggleExpand = (date: string) => {
    setGroupedHistory(prev => 
      prev.map(group => 
        group.date === date 
          ? { ...group, isExpanded: !group.isExpanded } 
          : group
      )
    );
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
                          <TableHead className="w-[60px]"></TableHead>
                          <TableHead>Date</TableHead>
                          {userRole === "admin" && selectedPatientId === "" && (
                            <TableHead>Patient</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupedHistory.length > 0 ? (
                          groupedHistory.map((group) => (
                            <Fragment key={group.date}>
                              <TableRow 
                                className="cursor-pointer hover:bg-accent/50"
                                onClick={() => toggleExpand(group.date)}
                              >
                                <TableCell>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                    {group.isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatDate(group.date)}
                                </TableCell>
                                {userRole === "admin" && selectedPatientId === "" && (
                                  <TableCell>
                                    {patients.find(p => p.id === group.patientId)?.name || "Unknown"}
                                  </TableCell>
                                )}
                              </TableRow>
                              
                              {group.isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={userRole === "admin" && selectedPatientId === "" ? 3 : 2}>
                                    <div className="pl-10 py-2">
                                      <Table className="border-0">
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Medicine</TableHead>
                                            <TableHead>Quantity Taken</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {group.entries.map(entry => (
                                            <TableRow key={entry.id}>
                                              <TableCell>{entry.medicine}</TableCell>
                                              <TableCell>{entry.quantity}</TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell 
                              colSpan={userRole === "admin" && selectedPatientId === "" ? 3 : 2} 
                              className="h-24 text-center"
                            >
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
