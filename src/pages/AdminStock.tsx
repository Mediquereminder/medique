
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Plus, Minus, LogOut, Menu, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface MedicationStock {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
}

const initialStock: MedicationStock[] = [
  {
    id: "1",
    name: "Aspirin",
    quantity: 150,
    threshold: 50,
    lastUpdated: "2024-03-15",
  },
  {
    id: "2",
    name: "Vitamin C",
    quantity: 75,
    threshold: 30,
    lastUpdated: "2024-03-14",
  },
  {
    id: "3",
    name: "Paracetamol",
    quantity: 25,
    threshold: 40,
    lastUpdated: "2024-03-13",
  },
];

const AdminStock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stock, setStock] = useState<MedicationStock[]>(initialStock);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email || user.role !== "admin") {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const updateQuantity = (id: string, change: number) => {
    setStock((prevStock) =>
      prevStock.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + change),
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : item
      )
    );

    toast({
      title: "Stock Updated",
      description: "Medication stock has been successfully updated.",
    });
  };

  const filteredStock = stock.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">
                  Medique
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search medications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStock.map((item) => (
                  <Card
                    key={item.id}
                    className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-lg font-semibold">
                        {item.name}
                      </CardTitle>
                      <Package className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Current Stock:
                          </span>
                          <span
                            className={`font-semibold ${
                              item.quantity < item.threshold
                                ? "text-red-500"
                                : "text-green-500"
                            }`}
                          >
                            {item.quantity} units
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Threshold:
                          </span>
                          <span className="font-medium">{item.threshold} units</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            Last Updated:
                          </span>
                          <span className="font-medium">{item.lastUpdated}</span>
                        </div>
                        <div className="flex justify-between gap-2 mt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminStock;
