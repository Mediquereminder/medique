
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, LogOut, Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample medication history data
const medicationHistory = {
  "2024-08-01": {
    "Aspirin": true,
    "Vitamin C": true,
    "Paracetamol": false,
  },
  "2024-08-02": {
    "Aspirin": true,
    "Vitamin C": false,
    "Paracetamol": true,
  },
  "2024-08-03": {
    "Aspirin": false,
    "Vitamin C": true,
    "Paracetamol": true,
  },
};

const History = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayMedications, setDayMedications] = useState<{ [key: string]: boolean }>({});
  const [userRole, setUserRole] = useState<'patient' | 'admin'>('patient');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    setUserRole(user.role || 'patient');
  }, [navigate]);

  useEffect(() => {
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setDayMedications(medicationHistory[dateStr] || {});
    }
  }, [selectedDate]);

  // Calculate compliance data for chart
  const complianceData = Object.entries(medicationHistory).map(([date, meds]) => {
    const total = Object.keys(meds).length;
    const taken = Object.values(meds).filter(Boolean).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      compliance: (taken / total) * 100,
    };
  });

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const getBaseUrl = () => {
    return userRole === 'admin' ? '/admin-dashboard' : '/dashboard';
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role={userRole} />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80">
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
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Calendar Section */}
                <Card className="md:col-span-1 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
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

                {/* Daily Medications Section */}
                {selectedDate && (
                  <Card className="md:col-span-1 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <CardTitle>
                        Medications for {selectedDate.toLocaleDateString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(dayMedications).map(([medication, taken]) => (
                          <div
                            key={medication}
                            className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border-2 border-primary/20 hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  taken ? "bg-green-500" : "bg-red-500"
                                }`}
                              />
                              <span className="font-medium">{medication}</span>
                            </div>
                            {taken ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        ))}
                        {Object.keys(dayMedications).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            No medications recorded for this date
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Compliance Chart */}
                <Card className="md:col-span-2 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Medication Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complianceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis unit="%" />
                          <Tooltip />
                          <Bar
                            dataKey="compliance"
                            fill="#4FD1C5"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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

export default History;
