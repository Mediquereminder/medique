
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StockNavbar } from "@/components/stock/StockNavbar";
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  History as HistoryIcon, 
  UserCog, 
  LinkIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface HistoryEntry {
  id: string;
  date: string;
  medicine: string;
  quantity: string;
  patientId: string;
  taken: boolean;
}

// Group medications by date for the sublist view
interface GroupedHistory {
  date: string;
  entries: HistoryEntry[];
  patientId: string;
  isExpanded?: boolean;
}

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const savedHistory = localStorage.getItem("medicationHistory");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory[]>([]);
  const [currentUser, setCurrentUser] = useState<any>({});
  const [caretakerConnected, setCaretakerConnected] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
      return;
    }
    
    if (user.role !== "patient") {
      // Redirect non-patients away from this page
      navigate(user.role === "admin" ? "/admin-dashboard" : "/dashboard");
      return;
    }
    
    setCurrentUser(user);
    
    // Check if patient has any caretakers
    setCaretakerConnected(user.connectedCaretakers && user.connectedCaretakers.length > 0);
    
    // Filter history for this patient
    const filteredHistory = history.filter(entry => entry.patientId === user.userId);
    
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
  }, [history, navigate]);

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

  const copyPatientCode = () => {
    if (currentUser.uniqueCode) {
      navigator.clipboard.writeText(currentUser.uniqueCode)
        .then(() => {
          toast({
            title: "Code Copied",
            description: "Your unique code has been copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            variant: "destructive",
            title: "Failed to copy",
            description: "Please manually select and copy the code",
          });
        });
    }
  };

  const renderEmptyState = () => {
    if (!caretakerConnected) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-lg shadow-sm space-y-6">
          <div className="bg-blue-50 p-4 rounded-full">
            <UserCog className="h-10 w-10 text-blue-500" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-medium text-gray-900">No Caretaker Connected</h3>
            <p className="text-muted-foreground">
              You don't have any medication history yet. Connect with a caretaker who can manage your medications.
            </p>
            <div className="pt-4">
              <div className="flex flex-col space-y-3">
                <p className="text-sm font-medium">Your unique patient code:</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-muted px-4 py-2 rounded-md font-mono text-sm">
                    {currentUser.uniqueCode || "Loading..."}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={copyPatientCode}
                    disabled={!currentUser.uniqueCode}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Share this code with your caretaker to connect</p>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-lg shadow-sm space-y-6">
          <div className="bg-blue-50 p-4 rounded-full">
            <HistoryIcon className="h-10 w-10 text-blue-500" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-medium text-gray-900">No Medication History Yet</h3>
            <p className="text-muted-foreground">
              You're connected with a caretaker, but don't have any medication history yet. 
              Your caretaker will schedule medications for you soon.
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <StockNavbar onLogout={handleLogout} />
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Medication History</CardTitle>
                  <CardDescription>
                    Track your medication intake history and adherence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupedHistory.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px]"></TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedHistory.map((group) => (
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
                              </TableRow>
                              
                              {group.isExpanded && (
                                <TableRow>
                                  <TableCell colSpan={2}>
                                    <div className="pl-10 py-2">
                                      <Table className="border-0">
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Medicine</TableHead>
                                            <TableHead>Taken</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {group.entries.map(entry => (
                                            <TableRow key={entry.id}>
                                              <TableCell>{entry.medicine}</TableCell>
                                              <TableCell>
                                                {entry.taken ? (
                                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                ) : (
                                                  <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Fragment>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    renderEmptyState()
                  )}
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
