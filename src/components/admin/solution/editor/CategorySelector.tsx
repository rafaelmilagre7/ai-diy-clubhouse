
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn("flex flex-col space-y-2", className)}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Receita" id="category-revenue" />
        <Label htmlFor="category-revenue" className="text-sm cursor-pointer">
          Aumento de Receita
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Operacional" id="category-operational" />
        <Label htmlFor="category-operational" className="text-sm cursor-pointer">
          Otimização Operacional
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="Estratégia" id="category-strategy" />
        <Label htmlFor="category-strategy" className="text-sm cursor-pointer">
          Gestão Estratégica
        </Label>
      </div>
    </RadioGroup>
  );
};

export default CategorySelector;
