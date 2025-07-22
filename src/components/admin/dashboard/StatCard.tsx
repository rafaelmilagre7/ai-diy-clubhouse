
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  subtitle?: string;
  value: number | string;
  icon?: ReactNode;
  percentageChange?: number;
  percentageText?: string;
  reverseColors?: boolean;
  colorScheme?: "blue" | "green" | "red" | "orange" | "purple" | "indigo" | "emerald";
}

export const StatCard = ({
  title,
  subtitle,
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
      case "green": return "text-emerald-500";
      case "emerald": return "text-emerald-500";
      case "red": return "text-red-500";
      case "orange": return "text-orange-500";
      case "purple": return "text-purple-500";
      case "indigo": return "text-indigo-500";
      case "blue": return "text-blue-500";
      default: return "text-primary";
    }
  };

  const getPercentageColor = () => {
    if (effectivelyPositive) {
      return "text-green-400";
    } else {
      return "text-red-400";
    }
  };

  return (
    <div className="aurora-glass rounded-xl p-6 aurora-hover-scale">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground/70">({subtitle})</p>
            )}
          </div>
          <h3 className="text-3xl font-bold aurora-text-gradient mt-2">{value}</h3>
          
          {percentageChange !== undefined && (
            <div className="flex items-center mt-3">
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 aurora-glow">
            <div className={cn(getIconColor())}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
