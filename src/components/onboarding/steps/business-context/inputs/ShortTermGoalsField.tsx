
import React, { useCallback } from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

const shortTermGoals = [
  { id: "first_ai_solution", label: "Implementar primeira solução de IA no negócio" },
  { id: "automate_customer_service", label: "Automatizar processo de atendimento" },
  { id: "virtual_assistant", label: "Criar assistente virtual para área comercial" },
  { id: "optimize_internal_processes", label: "Otimizar processos internos com IA" },
  { id: "ai_content", label: "Desenvolver conteúdo com auxílio de IA" },
  { id: "team_training", label: "Treinar equipe em ferramentas de IA" },
  { id: "ai_marketing", label: "Implementar estratégia de marketing com IA" },
  { id: "sales_conversion", label: "Aumentar conversão de vendas com IA" },
  { id: "cost_reduction", label: "Reduzir custos operacionais com automação" },
  { id: "new_product", label: "Lançar novo produto/serviço utilizando IA" }
];

export interface Props {
  control: any;
  error?: any;
  onChange?: () => void;
}

export const ShortTermGoalsField: React.FC<Props> = React.memo(({ control, error, onChange }) => {
  const handleChange = useCallback((checked: boolean, currentValue: string[], goalId: string, onChange: any) => {
    const updatedValue = checked
      ? [...(currentValue || []), goalId]
      : (currentValue || []).filter((v: string) => v !== goalId);
    onChange(updatedValue);
  }, []);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        Objetivos de Curto Prazo (3-6 meses)<span className="text-red-500">*</span>
      </h3>
      <p className="text-sm text-gray-500">Selecione até 5 opções</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        <Controller
          name="short_term_goals"
          control={control}
          rules={{
            validate: value => {
              if (!Array.isArray(value) || value.length === 0) return "Selecione pelo menos um objetivo";
              if (value.length > 5) return "Selecione no máximo 5 objetivos";
              return true;
            }
          }}
          render={({ field }) => (
            <>
              {shortTermGoals.map((goal) => (
                <div key={goal.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={Array.isArray(field.value) && field.value.includes(goal.id)}
                    onCheckedChange={(checked) => {
                      handleChange(!!checked, field.value, goal.id, field.onChange);
                      if (onChange) onChange();
                    }}
                  />
                  <label
                    htmlFor={`goal-${goal.id}`}
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
});

ShortTermGoalsField.displayName = "ShortTermGoalsField";
