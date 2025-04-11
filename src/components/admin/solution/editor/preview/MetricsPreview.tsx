
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
    <div className="my-6 p-4 border border-indigo-200 bg-indigo-50 rounded-lg">
      <h4 className="font-bold text-indigo-800 text-lg">{data.title}</h4>
      
      {data.description && (
        <p className="mt-2 text-indigo-700">{data.description}</p>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {data.metrics.map((metric, index) => (
          <div key={index} className="bg-white p-4 rounded-md shadow-sm">
            <p className="text-sm text-indigo-500 font-medium">{metric.label}</p>
            <p className="text-2xl font-bold text-indigo-800">
              {metric.value}{metric.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MetricsPreview;
