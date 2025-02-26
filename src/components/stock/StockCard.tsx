
import { Package, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockCardProps {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  lastUpdated: string;
  onUpdateQuantity: (id: string, change: number) => void;
  onDelete: (id: string) => void;
}

export const StockCard = ({
  id,
  name,
  quantity,
  threshold,
  lastUpdated,
  onUpdateQuantity,
  onDelete,
}: StockCardProps) => {
  const isLowStock = quantity < threshold;

  return (
    <Card className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
      isLowStock ? "border-2 border-[#ea384c]" : "border-2 border-primary/20"
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive/90"
          onClick={() => onDelete(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Stock:</span>
            <span className={`font-semibold ${
              isLowStock ? "text-red-500" : "text-green-500"
            }`}>
              {quantity} units
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Threshold:</span>
            <span className="font-medium">{threshold} units</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last Updated:</span>
            <span className="font-medium">{lastUpdated}</span>
          </div>
          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onUpdateQuantity(id, -1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onUpdateQuantity(id, 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
