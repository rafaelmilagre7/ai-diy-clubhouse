
import React from "react";
import { WarningBlockData } from "@/components/admin/solution/editor/BlockTypes";
import { AlertTriangle } from "lucide-react";

interface WarningBlockProps {
  data: WarningBlockData;
}

export const WarningBlock: React.FC<WarningBlockProps> = ({ data }) => {
  const { title, text } = data;
  
  return (
    <div className="my-6 p-4 border-l-4 border-status-warning bg-status-warning-lighter rounded">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-status-warning mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-status-warning">{title}</h4>
          <p className="text-status-warning mt-1 whitespace-pre-line">{text}</p>
        </div>
      </div>
    </div>
  );
};
