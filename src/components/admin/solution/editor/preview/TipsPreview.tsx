
import React from "react";
import { Lightbulb } from "lucide-react";
import { TipsBlockData } from "../BlockTypes";

interface TipsPreviewProps {
  data: TipsBlockData;
}

const TipsPreview: React.FC<TipsPreviewProps> = ({ data }) => {
  return (
    <div className="my-4 p-4 border border-pink-200 bg-pink-50 rounded-lg">
      <h4 className="font-bold text-pink-800">{data.title}</h4>
      
      <ul className="mt-3 space-y-3">
        {data.items.map((item, index) => (
          <li key={index} className="flex items-start">
            <Lightbulb className="h-5 w-5 text-pink-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-pink-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TipsPreview;
