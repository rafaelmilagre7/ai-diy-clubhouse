
import React from "react";
import { CheckCircle } from "lucide-react";

interface BenefitsPreviewProps {
  data: {
    title: string;
    items: string[];
  };
}

const BenefitsPreview: React.FC<BenefitsPreviewProps> = ({ data }) => {
  return (
    <div className="my-4 p-4 border border-green-200 bg-green-50 rounded-lg">
      <h4 className="font-bold text-green-800">{data.title}</h4>
      
      <ul className="mt-3 space-y-2">
        {data.items.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-green-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsPreview;
