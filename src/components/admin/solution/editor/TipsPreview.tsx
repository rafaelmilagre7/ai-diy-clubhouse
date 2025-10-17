
import React from "react";
import { Lightbulb } from "lucide-react";
import { TipsBlockData } from "./BlockTypes";

interface TipsPreviewProps {
  data: TipsBlockData;
}

const TipsPreview: React.FC<TipsPreviewProps> = ({ data }) => {
  return (
    <div className="my-4 p-4 border border-status-info/30 bg-status-info-lighter rounded-lg">
      <h4 className="font-bold text-status-info">{data.title}</h4>
      
      <ul className="mt-3 space-y-3">
        {data.items.map((item, index) => (
          <li key={index} className="flex items-start">
            <Lightbulb className="h-5 w-5 text-status-info mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-status-info">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TipsPreview;
