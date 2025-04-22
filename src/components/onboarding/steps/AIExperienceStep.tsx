
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
  desired_ai_areas: string[]; // Usando array para áreas desejadas
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
  // Verificar formato dos dados iniciais para debug
  useEffect(() => {
    console.log("Dados iniciais recebidos em AIExperienceStep:", initialData);
    if (typeof initialData === 'string') {
      console.warn("Recebido initialData como string em vez de objeto:", initialData);
    }
  }, [initialData]);

  // Valores iniciais considerando possíveis formatos
  const getInitialValues = () => {
    // Se initialData for string, usar objeto vazio
    const data = typeof initialData === 'string' ? {} : initialData || {};
    
    console.log("Usando dados iniciais processados:", data);
    
    return {
      knowledge_level: data.knowledge_level || "",
      previous_tools: Array.isArray(data.previous_tools) ? data.previous_tools : [],
      has_implemented: data.has_implemented || "",
      // Suporte para ambos os formatos de áreas desejadas
      desired_ai_areas: Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : 
                       data.desired_ai_area ? [data.desired_ai_area] : [],
      completed_formation: data.completed_formation || false,
      is_member_for_month: data.is_member_for_month || false,
      nps_score: data.nps_score !== undefined ? data.nps_score : 5,
      improvement_suggestions: data.improvement_suggestions || "",
    };
  };

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<AIExperienceFormValues>({
    defaultValues: getInitialValues()
  });

  // Atualizar valores iniciais quando os dados mudarem
  useEffect(() => {
    reset(getInitialValues());
  }, [initialData, reset]);

  // Valores do formulário para logging
  const formValues = watch();
  useEffect(() => {
    console.log("Valores atuais do formulário:", formValues);
  }, [formValues]);

  const onFormSubmit = (data: AIExperienceFormValues) => {
    // Formatar corretamente para o banco de dados
    const formattedData = {
      knowledge_level: data.knowledge_level,
      previous_tools: data.previous_tools,
      has_implemented: data.has_implemented,
      desired_ai_areas: data.desired_ai_areas, // Usando o array diretamente
      completed_formation: data.completed_formation,
      is_member_for_month: data.is_member_for_month,
      nps_score: data.nps_score,
      improvement_suggestions: data.improvement_suggestions,
    };
    
    console.log("Enviando dados formatados de AI Experience:", formattedData);
    
    // Encapsular em ai_experience conforme esperado pelo backend
    onSubmit("ai_exp", {
      ai_experience: formattedData
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

            {/* Pergunta: Já implementou alguma solução de IA? */}
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

            {/* Áreas desejadas para implementação - agora usando checkboxes para permitir múltiplas seleções */}
            <div className="space-y-2 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800">
                Quais áreas você deseja implementar soluções de IA no seu negócio?
              </h3>
              <Controller
                control={control}
                name="desired_ai_areas"
                rules={{ validate: (value) => value.length > 0 || "Selecione pelo menos uma área" }}
                render={({ field, fieldState }) => (
                  <div className="space-y-2 mt-2">
                    {desiredAreas.map(opt => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`area_${opt.value}`}
                          checked={field.value.includes(opt.value)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...field.value, opt.value]
                              : field.value.filter(v => v !== opt.value);
                            field.onChange(newValue);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-[#0ABAB5] focus:ring-[#0ABAB5]"
                        />
                        <label htmlFor={`area_${opt.value}`} className="text-sm">{opt.label}</label>
                      </div>
                    ))}
                    {fieldState.error && (
                      <span className="text-red-500 text-xs block mt-1">{fieldState.error.message}</span>
                    )}
                  </div>
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
