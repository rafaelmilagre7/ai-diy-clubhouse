
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

const importantKpis = [
  { id: "revenue", label: "Receita" },
  { id: "profit", label: "Lucro" },
  { id: "customer_acquisition", label: "Aquisição de Clientes" },
  { id: "customer_retention", label: "Retenção de Clientes" },
  { id: "churn_rate", label: "Taxa de Churn" },
  { id: "cac", label: "CAC (Custo de Aquisição de Cliente)" },
  { id: "ltv", label: "LTV (Valor do Tempo de Vida do Cliente)" },
  { id: "mrr", label: "MRR (Receita Recorrente Mensal)" },
  { id: "conversion_rate", label: "Taxa de Conversão" },
  { id: "operational_efficiency", label: "Eficiência Operacional" },
  { id: "nps", label: "NPS (Net Promoter Score)" }
];

export interface Props {
  control: any;
  error?: any;
  onChange?: () => void;
}

export const KpisField: React.FC<Props> = ({ control, error, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">KPIs Mais Importantes para o Negócio<span className="text-red-500">*</span></h3>
    <p className="text-sm text-gray-500">Selecione até 5 opções</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      <Controller
        name="important_kpis"
        control={control}
        rules={{
          required: "Selecione pelo menos um KPI",
          validate: value => (value?.length <= 5) || "Selecione no máximo 5 KPIs",
        }}
        render={({ field }) => (
          <>
            {importantKpis.map((kpi) => (
              <div key={kpi.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`kpi-${kpi.id}`}
                  checked={field.value?.includes(kpi.id)}
                  onCheckedChange={(checked) => {
                    const updatedValue = checked 
                      ? [...(field.value || []), kpi.id]
                      : (field.value || []).filter((v: string) => v !== kpi.id);
                    field.onChange(updatedValue);
                    if (onChange) onChange();
                  }}
                />
                <label 
                  htmlFor={`kpi-${kpi.id}`}
                  className="text-sm leading-none cursor-pointer"
                >
                  {kpi.label}
                </label>
              </div>
            ))}
          </>
        )}
      />
    </div>
    {error && <p className="text-red-500 text-sm">{error.message}</p>}
  </div>
);
