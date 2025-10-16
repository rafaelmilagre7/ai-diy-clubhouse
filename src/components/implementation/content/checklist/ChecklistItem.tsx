
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface ChecklistItemProps {
  item: {
    id: string;
    description: string;
  };
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const ChecklistItem = ({
  item,
  isChecked,
  onChange,
  disabled = false,
}: ChecklistItemProps) => {
  return (
    <Card className={`p-4 transition-all duration-200 ${isChecked ? 'bg-muted/50 border-aurora-primary/20' : 'hover:border-aurora-primary/40'}`}>
      <div className="flex items-center gap-3">
        <Checkbox
          id={`checkbox-${item.id}`}
          checked={isChecked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={isChecked ? "data-[state=checked]:bg-aurora-primary data-[state=checked]:text-white data-[state=checked]:border-aurora-primary" : ""}
        />
        <label
          htmlFor={`checkbox-${item.id}`}
          className={`text-sm cursor-pointer flex-1 ${isChecked ? "line-through text-muted-foreground" : ""}`}
        >
          {item.description}
        </label>
      </div>
    </Card>
  );
};
