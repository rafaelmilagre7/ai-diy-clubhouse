
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { AIKnowledgeLevelField } from "./ai-experience/AIKnowledgeLevelField";
import { AIToolsField } from "./ai-experience/AIToolsField";
import { AIFormationQuestions } from "./ai-experience/AIFormationQuestions";
import { AINPSField } from "./ai-experience/AINPSField";
import { AISuggestionsField } from "./ai-experience/AISuggestionsField";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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
  const formInitialized = useRef(false);
  const submitting = useRef(false);

  // Extrair os dados de experiência com IA do objeto inicial
  const extractAIExperienceData = useCallback(() => {
    if (!initialData) {
      return null;
    }
    
    // Tentar obter os dados da propriedade ai_experience
    let aiExpData = null;
    
    // Verificar se temos um objeto ai_experience
    if (initialData.ai_experience) {
      aiExpData = initialData.ai_experience;
    } 
    // Verificar se os dados estão na raiz
    else if (
      initialData.knowledge_level || 
      initialData.previous_tools || 
      initialData.has_implemented ||
      initialData.desired_ai_areas
    ) {
      aiExpData = initialData;
    }
    // Verificar se é um objeto com estrutura aninhada
    else if (typeof initialData === 'object') {
      // Procurar em outras propriedades comuns
      for (const key in initialData) {
        const value = initialData[key];
        if (
          value && 
          typeof value === 'object' && 
          (
            'knowledge_level' in value || 
            'previous_tools' in value || 
            'has_implemented' in value ||
            'desired_ai_areas' in value
          )
        ) {
          aiExpData = value;
          break;
        }
      }
    }
    
    // Se ainda é uma string, tentar fazer parse
    if (typeof aiExpData === 'string') {
      try {
        aiExpData = JSON.parse(aiExpData);
      } catch (e) {
        console.warn("Não foi possível converter string para objeto:", e);
        return null;
      }
    }
    
    return aiExpData;
  }, [initialData]);

  // Obter dados de experiência com IA
  const aiExpData = useRef(extractAIExperienceData());

  // Valores iniciais considerando os dados extraídos
  const getInitialValues = useCallback((): AIExperienceFormValues => {
    // Se não temos dados extraídos, usar valores padrão
    const data = aiExpData.current;
    if (!data) {
      return {
        knowledge_level: "",
        previous_tools: [],
        has_implemented: "",
        desired_ai_areas: [],
        completed_formation: false,
        is_member_for_month: false,
        nps_score: 5,
        improvement_suggestions: "",
      };
    }
    
    return {
      knowledge_level: data.knowledge_level || "",
      previous_tools: Array.isArray(data.previous_tools) ? data.previous_tools : [],
      has_implemented: data.has_implemented || "",
      desired_ai_areas: Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [],
      completed_formation: data.completed_formation === true,
      is_member_for_month: data.is_member_for_month === true,
      nps_score: typeof data.nps_score === 'number' ? data.nps_score : 5,
      improvement_suggestions: data.improvement_suggestions || "",
    };
  }, []);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<AIExperienceFormValues>({
    defaultValues: getInitialValues()
  });

  // Atualizar valores iniciais apenas quando os dados mudarem e não estiver inicializado
  useEffect(() => {
    if (initialData && !formInitialized.current) {
      console.log("Inicializando formulário com dados:", initialData);
      aiExpData.current = extractAIExperienceData();
      reset(getInitialValues());
      formInitialized.current = true;
    }
  }, [initialData, reset, extractAIExperienceData, getInitialValues]);

  const onFormSubmit = (data: AIExperienceFormValues) => {
    // Evitar múltiplos envios
    if (submitting.current) {
      return;
    }
    
    submitting.current = true;

    // Formatar e enviar os dados
    const formattedData = {
      knowledge_level: data.knowledge_level,
      previous_tools: Array.isArray(data.previous_tools) ? data.previous_tools : [],
      has_implemented: data.has_implemented,
      desired_ai_areas: Array.isArray(data.desired_ai_areas) ? data.desired_ai_areas : [],
      completed_formation: data.completed_formation,
      is_member_for_month: data.is_member_for_month,
      nps_score: data.nps_score,
      improvement_suggestions: data.improvement_suggestions,
    };
    
    // Encapsular em ai_experience conforme esperado pelo backend
    onSubmit("ai_exp", {
      ai_experience: formattedData
    });
    
    // Resetar flag de submissão após um tempo para evitar bloqueios por erros
    setTimeout(() => {
      submitting.current = false;
    }, 2000);
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
                      <Label htmlFor="has_implemented_sim" className="text-sm">Sim</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="nao" id="has_implemented_nao" />
                      <Label htmlFor="has_implemented_nao" className="text-sm">Não</Label>
                    </div>
                    {fieldState.error && (
                      <span className="text-red-500 text-xs ml-4">{fieldState.error.message}</span>
                    )}
                  </RadioGroup>
                )}
              />
            </div>

            {/* Áreas desejadas para implementação - checkboxes para múltiplas seleções */}
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
                          checked={Array.isArray(field.value) && field.value.includes(opt.value)}
                          onChange={(e) => {
                            const currentValue = Array.isArray(field.value) ? field.value : [];
                            const newValue = e.target.checked
                              ? [...currentValue, opt.value]
                              : currentValue.filter(v => v !== opt.value);
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
            disabled={isSubmitting || submitting.current}
          >
            {isSubmitting || submitting.current ? (
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
