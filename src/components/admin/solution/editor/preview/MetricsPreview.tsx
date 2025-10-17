
import React from "react";

interface Metric {
  label: string;
  value: string;
  unit: string;
}

interface MetricsPreviewProps {
  data: {
    title: string;
    description: string;
    metrics: Metric[];
  };
}

const MetricsPreview: React.FC<MetricsPreviewProps> = ({ data }) => {
  return (
    <div className="my-6 p-4 border border-operational/30 bg-operational/10 rounded-lg">
      <h4 className="font-bold text-operational text-lg">{data.title}</h4>
      
      {data.description && (
        <p className="mt-2 text-foreground">{data.description}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {data.metrics.map((metric, index) => (
          <div key={index} className="bg-card p-4 rounded-md shadow-sm border border-border">
            <p className="text-sm text-operational font-medium">{metric.label}</p>
            <p className="text-2xl font-bold text-foreground">
              {metric.value}{metric.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPreview;
