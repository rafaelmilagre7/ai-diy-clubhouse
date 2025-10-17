
import React from "react";

interface Step {
  title: string;
  description: string;
  imageUrl: string;
}

interface StepsPreviewProps {
  data: {
    title: string;
    steps: Step[];
  };
}

const StepsPreview: React.FC<StepsPreviewProps> = ({ data }) => {
  return (
    <div className="my-6">
      <h3 className="text-xl font-bold mb-4">{data.title}</h3>
      
      <div className="space-y-6">
        {data.steps.map((step, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 bg-muted p-4 rounded-lg border">
            <div className="md:w-2/3">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold mr-2">
                  {index + 1}
                </div>
                <h4 className="font-bold text-lg">{step.title}</h4>
              </div>
              
              <div className="text-foreground whitespace-pre-line">
                {step.description}
              </div>
            </div>
            
            {step.imageUrl && (
              <div className="md:w-1/3 flex items-center justify-center">
                <img 
                  src={step.imageUrl} 
                  alt={`Imagem para ${step.title}`} 
                  className="max-h-[200px] object-contain rounded"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepsPreview;
