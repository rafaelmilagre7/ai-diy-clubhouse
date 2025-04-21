
import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface AIImplementedSolutionsFieldProps {
  control: any;
}

const implementedSolutionsOptions = [
  "Assistente de atendimento (chatbot)",
  "Automação de processos com IA",
  "Personalização de marketing com IA",
  "Transcrição e análise de reuniões",
  "Assistente de RH/Recrutamento",
  "Geração de conteúdo com IA",
  "Análise de dados com IA",
  "Assistente de vendas com IA",
  "Automação de criação de imagens/vídeos",
  "Nenhuma até o momento",
  "Outro",
];

export const AIImplementedSolutionsField: React.FC<AIImplementedSolutionsFieldProps> = ({ control }) => (
  <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
    <h3 className="text-lg font-medium text-gray-800">Quais soluções de IA você já implementou?</h3>
    <Controller
      control={control}
      name="implemented_solutions"
      rules={{ required: "Selecione pelo menos uma opção" }}
      render={({ field, fieldState }) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {implementedSolutionsOptions.map((solution) => (
            <label key={solution} className="flex items-center gap-2">
              <Checkbox
                checked={field.value?.includes(solution)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    field.onChange([...(field.value || []), solution]);
                  } else {
                    field.onChange(
                      field.value?.filter((s: string) => s !== solution) || []
                    );
                  }
                }}
                id={`implemented-${solution}`}
              />
              <span className="text-sm">{solution}</span>
            </label>
          ))}
          {fieldState.error && (
            <span className="text-red-500 text-xs col-span-full">
              {fieldState.error.message}
            </span>
          )}
        </div>
      )}
    />
  </div>
);
