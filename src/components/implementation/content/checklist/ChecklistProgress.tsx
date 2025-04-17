
import React from "react";

interface ChecklistProgressProps {
  completedItems: number;
  totalItems: number;
}

export const ChecklistProgress: React.FC<ChecklistProgressProps> = ({ 
  completedItems, 
  totalItems 
}) => {
  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-green-800">
          Progresso do checklist
        </span>
        <span className="text-sm font-medium text-green-800">
          {completedItems} de {totalItems}
        </span>
      </div>
    </div>
  );
};
