
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useToast } from "@/components/ui/use-toast";
import { StockCard } from "@/components/stock/StockCard";
import { SearchBar } from "@/components/stock/SearchBar";
import { StockNavbar } from "@/components/stock/StockNavbar";

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
          <StockNavbar onLogout={handleLogout} />
          
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="mb-6">
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => setSearchQuery(value)}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStock.map((item) => (
                  <StockCard
                    key={item.id}
                    {...item}
                    onUpdateQuantity={updateQuantity}
                  />
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
