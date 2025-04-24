
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

const businessChallenges = [
  { id: "growth", label: "Crescimento acelerado" },
  { id: "leads", label: "Geração de leads qualificados" },
  { id: "automation", label: "Automação de processos" },
  { id: "conversion", label: "Conversão de vendas" },
  { id: "retention", label: "Retenção de clientes" },
  { id: "ai_implementation", label: "Implementação eficiente de IA" },
  { id: "data_analysis", label: "Análise e uso efetivo de dados" },
  { id: "team_training", label: "Capacitação de equipe em IA" },
  { id: "cost_optimization", label: "Otimização de custos" },
  { id: "product_development", label: "Desenvolvimento de novos produtos" }
];

export interface Props {
  control: any;
  error?: any;
  onChange?: () => void;
}

export const BusinessChallengesField: React.FC<Props> = ({ control, error, onChange }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Principais Desafios do Negócio<span className="text-red-500">*</span></h3>
    <p className="text-sm text-gray-500">Selecione até 5 opções</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      <Controller
        name="business_challenges"
        control={control}
        rules={{
          required: "Selecione pelo menos um desafio",
          validate: value => (value?.length <= 5) || "Selecione no máximo 5 desafios"
        }}
        render={({ field }) => (
          <>
            {businessChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`challenge-${challenge.id}`}
                  checked={field.value?.includes(challenge.id)}
                  onCheckedChange={(checked) => {
                    const updatedValue = checked 
                      ? [...(field.value || []), challenge.id]
                      : (field.value || []).filter((v: string) => v !== challenge.id);
                    field.onChange(updatedValue);
                    if (onChange) onChange();
                  }}
                />
                <label 
                  htmlFor={`challenge-${challenge.id}`}
                  className="text-sm leading-none cursor-pointer"
                >
                  {challenge.label}
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
