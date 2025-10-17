
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, TrendingUp } from "lucide-react";

interface Metric {
  label: string;
  value: string;
  unit: string;
}

interface MetricsBlockProps {
  data: {
    title: string;
    description: string;
    metrics: Metric[];
  };
  onChange: (data: any) => void;
}

const MetricsBlock: React.FC<MetricsBlockProps> = ({ data, onChange }) => {
  const updateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...data.metrics];
    newMetrics[index] = {
      ...newMetrics[index],
      [field]: value
    };
    onChange({ ...data, metrics: newMetrics });
  };

  const addMetric = () => {
    onChange({
      ...data,
      metrics: [...data.metrics, { label: "", value: "", unit: "" }]
    });
  };

  const removeMetric = (index: number) => {
    const newMetrics = [...data.metrics];
    newMetrics.splice(index, 1);
    onChange({ ...data, metrics: newMetrics });
  };

  const getMetricColor = (index: number) => {
    const colors = [
      "bg-operational/10 border-operational/20 text-operational",
      "bg-system-healthy/10 border-system-healthy/20 text-system-healthy",
      "bg-operational/10 border-operational/20 text-operational",
      "bg-status-warning/10 border-status-warning/20 text-status-warning",
      "bg-operational/10 border-operational/20 text-operational",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-3">
      <Input
        value={data.title}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Título da seção de métricas"
      />
      
      <Textarea
        value={data.description}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Descrição ou contextualização das métricas..."
        className="min-h-20"
      />
      
      <div className="space-y-4 mt-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm text-muted-foreground">Métricas:</h4>
          <Button variant="outline" size="sm" onClick={addMetric}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Métrica
          </Button>
        </div>
        
        {data.metrics.map((metric, index) => (
          <div key={index} className="border p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h5 className="font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-muted-foreground" />
                Métrica {index + 1}
              </h5>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMetric(index)}
                disabled={data.metrics.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input
                value={metric.label}
                onChange={(e) => updateMetric(index, "label", e.target.value)}
                placeholder="Nome da métrica"
              />
              
              <div className="flex gap-2">
                <Input
                  value={metric.value}
                  onChange={(e) => updateMetric(index, "value", e.target.value)}
                  placeholder="Valor"
                  className="flex-1"
                />
                
                <Input
                  value={metric.unit}
                  onChange={(e) => updateMetric(index, "unit", e.target.value)}
                  placeholder="Unidade (ex: %, dias)"
                  className="w-32"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-6 border rounded-md bg-muted">
        <h4 className="font-bold text-xl mb-2">{data.title || "Métricas"}</h4>
        {data.description && <p className="mt-1 text-muted-foreground mb-4">{data.description}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {data.metrics.map((metric, index) => (
            <div key={index} className={`p-4 rounded-md shadow-sm ${getMetricColor(index)}`}>
              <p className="text-sm font-medium opacity-80">{metric.label || "Nome da métrica"}</p>
              <p className="text-2xl font-bold mt-1">
                {metric.value || "0"}{metric.unit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsBlock;
