
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

const mediumTermGoals = [
  { id: "scale_ai", label: "Escalar soluções de IA implementadas" },
  { id: "create_internal_department", label: "Criar departamento interno focado em IA" },
  { id: "measure_roi", label: "Mensurar e otimizar ROI das soluções de IA" },
  { id: "expand_markets", label: "Expandir para novos mercados utilizando IA" },
  { id: "omnichannel", label: "Implementar estratégia omnichannel com IA" },
  { id: "develop_services", label: "Desenvolver oferta de serviços baseados em IA" },
  { id: "integrate_ai", label: "Integrar múltiplas soluções de IA nos processos" },
  { id: "advanced_data_analysis", label: "Implementar análise avançada de dados com IA" },
  { id: "product_with_ai", label: "Desenvolver produto próprio com base em IA" },
  { id: "market_reference", label: "Tornar-se referência no seu setor em uso de IA" },
];

export interface Props {
  control: any;
  error?: any;
  onChange?: () => void;
}

export const MediumTermGoalsField: React.FC<Props> = ({ control, error, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">
      Objetivos de Médio Prazo (6-12 meses)<span className="text-red-500">*</span>
    </h3>
    <p className="text-sm text-gray-500">Selecione até 5 opções</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      <Controller
        name="medium_term_goals"
        control={control}
        rules={{
          required: "Selecione pelo menos um objetivo de médio prazo",
          validate: value => (value?.length <= 5) || "Selecione no máximo 5 objetivos de médio prazo"
        }}
        render={({ field }) => (
          <>
            {mediumTermGoals.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`medium_goal-${goal.id}`}
                  checked={field.value?.includes(goal.id)}
                  onCheckedChange={(checked) => {
                    const updatedValue = checked
                      ? [...(field.value || []), goal.id]
                      : (field.value || []).filter((v: string) => v !== goal.id);
                    field.onChange(updatedValue);
                    if (onChange) onChange();
                  }}
                />
                <label
                  htmlFor={`medium_goal-${goal.id}`}
                  className="text-sm leading-none cursor-pointer"
                >
                  {goal.label}
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
