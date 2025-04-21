
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

const shortTermGoals = [
  { id: "first_ai_solution", label: "Implementar primeira solução de IA no negócio" },
  { id: "automate_support", label: "Automatizar processo de atendimento" },
  { id: "virtual_assistant", label: "Criar assistente virtual para área comercial" },
  { id: "optimize_processes", label: "Otimizar processos internos com IA" },
  { id: "ai_content", label: "Desenvolver conteúdo com auxílio de IA" },
  { id: "train_team", label: "Treinar equipe em ferramentas de IA" },
  { id: "ai_marketing", label: "Implementar estratégia de marketing com IA" },
  { id: "increase_sales", label: "Aumentar conversão de vendas com IA" },
  { id: "reduce_costs", label: "Reduzir custos operacionais com automação" },
  { id: "launch_product", label: "Lançar novo produto/serviço utilizando IA" }
];

export interface Props {
  control: any;
  error?: any;
  onChange?: () => void;
}

export const ShortTermGoalsField: React.FC<Props> = ({ control, error, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Objetivos de Curto Prazo (3-6 meses)<span className="text-red-500">*</span></h3>
    <p className="text-sm text-gray-500">Selecione até 3 opções</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      <Controller
        name="short_term_goals"
        control={control}
        rules={{
          required: "Selecione pelo menos um objetivo",
          validate: value => (value?.length <= 3) || "Selecione no máximo 3 objetivos",
        }}
        render={({ field }) => (
          <>
            {shortTermGoals.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`goal-${goal.id}`}
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
