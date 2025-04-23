
import React from "react";
import { Badge } from "@/components/ui/badge";
import { BenefitType } from "@/types/toolTypes";
import { cn } from "@/lib/utils";

interface BenefitBadgeProps {
  type: BenefitType;
  className?: string; // Adicionando suporte para className
}

export const BenefitBadge: React.FC<BenefitBadgeProps> = ({ type, className }) => {
  const getBadgeStyle = () => {
    switch (type) {
      case "discount":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "exclusive":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "free":
        return "bg-green-100 text-green-800 border-green-200";
      case "trial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getLabel = () => {
    switch (type) {
      case "discount":
        return "Desconto";
      case "exclusive":
        return "Exclusivo";
      case "free":
        return "Gratuito";
      case "trial":
        return "Trial Estendido";
      default:
        return "Benefício";
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(`text-xs ${getBadgeStyle()}`, className)}
    >
      {getLabel()}
    </Badge>
  );
};
