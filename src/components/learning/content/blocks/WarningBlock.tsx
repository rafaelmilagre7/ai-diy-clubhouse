
import React from "react";
import { WarningBlockData } from "@/components/admin/solution/editor/BlockTypes";
import { AlertTriangle } from "lucide-react";

interface WarningBlockProps {
  data: WarningBlockData;
}

export const WarningBlock: React.FC<WarningBlockProps> = ({ data }) => {
  const { title, text } = data;
  
  return (
    <div className="my-6 p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-800 dark:text-amber-400">{title}</h4>
          <p className="text-amber-700 dark:text-amber-300 mt-1 whitespace-pre-line">{text}</p>
        </div>
      </div>
    </div>
  );
};
