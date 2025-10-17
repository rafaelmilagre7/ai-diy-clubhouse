
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
    <div className="my-4 p-4 border border-system-healthy/20 bg-system-healthy/10 rounded-lg">
      <h4 className="font-bold text-system-healthy">{data.title}</h4>
      
      <ul className="mt-3 space-y-2">
        {data.items.map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-system-healthy mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-system-healthy">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsPreview;
