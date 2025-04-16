
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  trend?: "up" | "down"; 
  trendValue?: string | number;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendValue }: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                <span>{trendValue}% que o mês anterior</span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 flex items-center justify-center rounded-md">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
