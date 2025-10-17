
import React from "react";
import { AlertTriangle } from "lucide-react";
import { WarningBlockData } from "../BlockTypes";

interface WarningPreviewProps {
  data: WarningBlockData;
}

const WarningPreview: React.FC<WarningPreviewProps> = ({ data }) => {
  return (
    <div className="my-4 p-4 border-l-4 border-status-warning bg-status-warning-lighter rounded">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-status-warning mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-status-warning">{data.title}</h4>
          <p className="text-status-warning mt-1 whitespace-pre-line">{data.text}</p>
        </div>
      </div>
    </div>
  );
};

export default WarningPreview;
