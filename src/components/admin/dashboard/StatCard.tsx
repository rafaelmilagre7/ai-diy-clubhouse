
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  percentageChange?: number;
  percentageText?: string;
  reverseColors?: boolean;
  colorScheme?: "blue" | "green" | "red" | "orange";
}

export const StatCard = ({
  title,
  value,
  icon,
  percentageChange,
  percentageText = "em relação ao período anterior",
  reverseColors = false,
  colorScheme = "blue"
}: StatCardProps) => {
  // Determinar se a mudança é positiva ou negativa
  const isPositive = percentageChange === undefined ? true : percentageChange >= 0;
  
  // Se reverseColors for true, considera positivo como negativo e vice-versa
  const effectivelyPositive = reverseColors ? !isPositive : isPositive;

  // Determinar cores com base no colorScheme
  const getIconColor = () => {
    switch(colorScheme) {
      case "green": return "text-[#0ABAB5] bg-[#0ABAB5]/10";
      case "red": return "text-red-500 bg-red-50";
      case "orange": return "text-orange-500 bg-orange-50";
      default: return "text-[#0ABAB5] bg-[#0ABAB5]/10";
    }
  };

  const getPercentageColor = () => {
    if (effectivelyPositive) {
      return "text-green-600";
    } else {
      return "text-red-600";
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-neutral-300 dark:text-neutral-300 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
            
            {percentageChange !== undefined && (
              <div className="flex items-center mt-2">
                <span className={cn("flex items-center text-sm font-medium", getPercentageColor())}>
                  {effectivelyPositive ? (
                    <TrendingUp className="mr-1 h-4 w-4" />
                  ) : (
                    <TrendingDown className="mr-1 h-4 w-4" />
                  )}
                  {Math.abs(percentageChange)}% {percentageText}
                </span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className={cn("p-2 rounded-full", getIconColor())}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
