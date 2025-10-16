
import React from "react";
import { CTABlockData } from "../BlockTypes";

interface CTAPreviewProps {
  data: CTABlockData;
}

const CTAPreview: React.FC<CTAPreviewProps> = ({ data }) => {
  return (
    <div className="my-6 p-6 border border-aurora-primary/20 bg-aurora-primary/5 rounded-lg text-center">
      <h3 className="font-bold text-foreground text-xl">{data.title}</h3>
      
      {data.text && (
        <p className="mt-2 mb-4 text-muted-foreground max-w-lg mx-auto">{data.text}</p>
      )}
      
      <a 
        href={data.buttonLink || "#"} 
        className="inline-block px-6 py-2 bg-aurora-primary text-white rounded-full font-medium hover:bg-aurora-primary-dark transition-colors"
      >
        {data.buttonText || "Continuar"}
      </a>
    </div>
  );
};

export default CTAPreview;
