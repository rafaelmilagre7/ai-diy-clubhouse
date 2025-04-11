
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  className
}) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className={cn("flex space-x-2", className)}
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="easy" id="difficulty-easy" />
        <Label htmlFor="difficulty-easy" className="text-sm cursor-pointer">
          Fácil
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="medium" id="difficulty-medium" />
        <Label htmlFor="difficulty-medium" className="text-sm cursor-pointer">
          Médio
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="advanced" id="difficulty-advanced" />
        <Label htmlFor="difficulty-advanced" className="text-sm cursor-pointer">
          Avançado
        </Label>
      </div>
    </RadioGroup>
  );
};

export default DifficultySelector;
