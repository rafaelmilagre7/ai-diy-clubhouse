
import React from "react";
import { ChecklistBlockData } from "@/components/admin/solution/editor/BlockTypes";
import { CheckSquare, Square } from "lucide-react";

interface ChecklistBlockProps {
  data: ChecklistBlockData;
  interactive?: boolean;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({ data, interactive = false }) => {
  const { items } = data;
  
  if (!items || !items.length) {
    return null;
  }
  
  return (
    <div className="my-6 border rounded-lg p-4 bg-background">
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              {item.checked ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <span className="ml-2 text-foreground">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
