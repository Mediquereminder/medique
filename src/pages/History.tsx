import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample medication history data (replace with actual data fetching)
const medicationHistory = {
  "2024-08-01": {
    "Aspirin": true,
    "Vitamin C": true,
  },
  "2024-08-02": {
    "Aspirin": true,
    "Vitamin C": false,
    "Paracetamol": true,
  },
  "2024-08-03": {
    "Aspirin": false,
    "Vitamin C": true,
  },
};

const History = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayMedications, setDayMedications] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setDayMedications(medicationHistory[dateStr] || {});
    }
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">Medique</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-primary mb-8">Medication History</h2>

                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Select Date</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>

                {selectedDate && (
                  <div className="mt-8 w-full max-w-2xl">
                    <h3 className="text-xl font-semibold text-primary mb-4">
                      Medications Taken on {selectedDate.toLocaleDateString()}
                    </h3>
                    <Card>
                      <CardContent>
                        <ul className="space-y-2">
                          {Object.entries(dayMedications).map(([medication, taken]) => (
                            <li key={medication} className="flex items-center justify-between">
                              <span>{medication}</span>
                              {taken ? (
                                <Check className="w-6 h-6 text-green-500" />
                              ) : (
                                <X className="w-6 h-6 text-red-500" />
                              )}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default History;
