
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { OnboardingData } from "@/types/onboarding";
import { AIKnowledgeLevelField } from "./ai-experience/AIKnowledgeLevelField";
import { AIToolsField } from "./ai-experience/AIToolsField";
import { AIFormationQuestions } from "./ai-experience/AIFormationQuestions";
import { AINPSField } from "./ai-experience/AINPSField";
import { AISuggestionsField } from "./ai-experience/AISuggestionsField";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AIExperienceFormStepProps {
  initialData?: OnboardingData["ai_experience"];
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
}

// Opções de área desejada
const desiredAreas = [
  { value: "vendas", label: "Soluções de IA para Vendas" },
  { value: "marketing", label: "Soluções de IA para Marketing" },
  { value: "rh", label: "Soluções de IA para RH" },
  { value: "analise_dados", label: "Soluções de IA para Análise de Dados" },
];

export const AIExperienceFormStep: React.FC<AIExperienceFormStepProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
}) => {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      knowledge_level: initialData?.knowledge_level || "",
      previous_tools: initialData?.previous_tools || [],
      has_implemented: initialData?.has_implemented || "",
      desired_ai_area: initialData?.desired_ai_area || "",
      completed_formation: initialData?.completed_formation || false,
      is_member_for_month: initialData?.is_member_for_month || false,
      nps_score: initialData?.nps_score || 5,
      improvement_suggestions: initialData?.improvement_suggestions || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit("ai_exp", { ai_experience: data })
      )}
      className="space-y-10"
    >
      {/* Nível de conhecimento em IA */}
      <AIKnowledgeLevelField control={control} />

      {/* Ferramentas de IA já utilizadas */}
      <AIToolsField control={control} />

      {/* Nova Pergunta: Já implementou alguma solução de IA? */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">
          Você já implementou alguma solução de IA?
        </h3>
        <Controller
          control={control}
          name="has_implemented"
          rules={{ required: "Selecione uma opção" }}
          render={({ field, fieldState }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex gap-6 mt-2"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sim" id="has_implemented_sim" />
                <label htmlFor="has_implemented_sim" className="text-sm">Sim</label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="nao" id="has_implemented_nao" />
                <label htmlFor="has_implemented_nao" className="text-sm">Não</label>
              </div>
              {fieldState.error && (
                <span className="text-red-500 text-xs ml-4">{fieldState.error.message}</span>
              )}
            </RadioGroup>
          )}
        />
      </div>

      {/* Pergunta: Em quais áreas deseja implementar soluções de IA? */}
      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800">
          Em quais áreas você deseja implementar soluções de IA no seu negócio?
        </h3>
        <Controller
          control={control}
          name="desired_ai_area"
          rules={{ required: "Selecione uma área" }}
          render={({ field, fieldState }) => (
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="flex flex-col gap-3 mt-2"
            >
              {desiredAreas.map(opt => (
                <div key={opt.value} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value} id={`area_${opt.value}`} />
                  <label htmlFor={`area_${opt.value}`} className="text-sm">{opt.label}</label>
                </div>
              ))}
              {fieldState.error && (
                <span className="text-red-500 text-xs ml-4">{fieldState.error.message}</span>
              )}
            </RadioGroup>
          )}
        />
      </div>

      {/* Perguntas sobre formação e tempo de clube */}
      <AIFormationQuestions control={control} />

      {/* NPS Field - pergunta atualizada */}
      <AINPSField control={control} />

      {/* Sugestões de melhorias */}
      <AISuggestionsField control={control} />

      {/* Botão de envio */}
      <Button
        type="submit"
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};
