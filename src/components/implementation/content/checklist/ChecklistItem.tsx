
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChecklistItem as ChecklistItemType } from "./checklistUtils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item, 
  isChecked, 
  onChange,
  disabled
}) => {
  return (
    <div key={item.id} className="flex items-start p-4 border rounded-md">
      <Checkbox
        id={`checklist-item-${item.id}`}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked as boolean)}
        className="mt-0.5 mr-3"
        disabled={disabled}
      />
      <div>
        <Label htmlFor={`checklist-item-${item.id}`} className="font-medium cursor-pointer">
          {item.title}
        </Label>
        {item.description && (
          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
};
