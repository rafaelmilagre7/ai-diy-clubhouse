
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { AIKnowledgeLevelField } from "./ai-experience/AIKnowledgeLevelField";
import { AIToolsField } from "./ai-experience/AIToolsField";
import { AIFormationQuestions } from "./ai-experience/AIFormationQuestions";
import { AINPSField } from "./ai-experience/AINPSField";
import { AISuggestionsField } from "./ai-experience/AISuggestionsField";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AIExperienceStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: any;
}

type AIExperienceFormValues = {
  knowledge_level: string;
  previous_tools: string[];
  has_implemented: string; // "sim" ou "nao"
  desired_ai_area: string; // "vendas" | "marketing" | "rh" | "analise_dados"
  completed_formation: boolean;
  is_member_for_month: boolean;
  nps_score: number;
  improvement_suggestions: string;
};

const desiredAreas = [
  { value: "vendas", label: "Soluções de IA para Vendas" },
  { value: "marketing", label: "Soluções de IA para Marketing" },
  { value: "rh", label: "Soluções de IA para RH" },
  { value: "analise_dados", label: "Soluções de IA para Análise de Dados" },
];

export const AIExperienceStep: React.FC<AIExperienceStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  // Valores iniciais simplificados
  const getInitialValues = () => {
    return {
      knowledge_level: initialData?.knowledge_level || "",
      previous_tools: initialData?.previous_tools || [],
      has_implemented: initialData?.has_implemented || "",
      desired_ai_area: initialData?.desired_ai_area || "",
      completed_formation: initialData?.completed_formation || false,
      is_member_for_month: initialData?.is_member_for_month || false,
      nps_score: initialData?.nps_score ?? 5,
      improvement_suggestions: initialData?.improvement_suggestions || "",
    };
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AIExperienceFormValues>({
    defaultValues: getInitialValues()
  });

  useEffect(() => {
    if (initialData) {
      reset(getInitialValues());
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: AIExperienceFormValues) => {
    onSubmit("ai_exp", {
      ai_experience: {
        knowledge_level: data.knowledge_level,
        previous_tools: data.previous_tools,
        has_implemented: data.has_implemented,
        desired_ai_area: data.desired_ai_area,
        completed_formation: data.completed_formation,
        is_member_for_month: data.is_member_for_month,
        nps_score: data.nps_score,
        improvement_suggestions: data.improvement_suggestions,
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Experiência com Inteligência Artificial
          </h2>
          <div className="space-y-8">
            <AIKnowledgeLevelField control={control} error={errors.knowledge_level} />
            <AIToolsField control={control} error={errors.previous_tools} />

            {/* Nova pergunta: Já implementou alguma solução de IA? */}
            <div className="space-y-2 bg-gray-50 p-6 rounded-lg">
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

            {/* Pergunta sobre áreas desejadas para implementação */}
            <div className="space-y-2 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800">
                Quais áreas você deseja implementar soluções de IA no seu negócio?
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
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Jornada no VIVER DE IA Club
          </h2>
          <div className="space-y-8">
            <AIFormationQuestions 
              control={control} 
              completedFormationError={errors.completed_formation}
              isMemberError={errors.is_member_for_month}
            />
            <AINPSField control={control} />
            <AISuggestionsField control={control} />
          </div>
        </div>
        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Salvando..."
            ) : (
              <span className="flex items-center gap-2">
                Próximo
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
