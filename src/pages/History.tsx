
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

// Sample medication history data - in a real app, this would come from an API
const medicationHistory = {
  "2024-04-10": { "Aspirin": true, "Vitamin C": false },
  "2024-04-09": { "Aspirin": true, "Vitamin C": true },
  "2024-04-08": { "Aspirin": false, "Vitamin C": true },
};

interface DayWithMedications {
  date: Date;
  medications: {
    [key: string]: boolean;
  };
}

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-primary mb-8">Medication History</h2>
                
                <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
                  {/* Calendar Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </CardContent>
                  </Card>

                  {/* Medications Status Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        Medications for {selectedDate?.toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(dayMedications).length > 0 ? (
                          Object.entries(dayMedications).map(([medication, taken]) => (
                            <div
                              key={medication}
                              className="flex items-center justify-between p-3 rounded-lg border"
                            >
                              <span className="font-medium">{medication}</span>
                              <div className={`flex items-center gap-2 ${
                                taken ? "text-green-600" : "text-red-600"
                              }`}>
                                {taken ? (
                                  <>
                                    <Check className="h-5 w-5" />
                                    <span>Taken</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="h-5 w-5" />
                                    <span>Missed</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-muted-foreground py-8">
                            No medication data for this date
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default History;
