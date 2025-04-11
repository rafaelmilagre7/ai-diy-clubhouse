
import React from "react";
import { AlertTriangle } from "lucide-react";

interface WarningPreviewProps {
  data: {
    title: string;
    text: string;
  };
}

const WarningPreview: React.FC<WarningPreviewProps> = ({ data }) => {
  return (
    <div className="my-4 p-4 border-l-4 border-amber-500 bg-amber-50 rounded">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-amber-800">{data.title}</h4>
          <p className="text-amber-700 mt-1 whitespace-pre-line">{data.text}</p>
        </div>
      </div>
    </div>
  );
};

export default WarningPreview;
