
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AIKnowledgeLevelField } from "./ai-experience/AIKnowledgeLevelField";
import { AIToolsField } from "./ai-experience/AIToolsField";
import { AIImplementedSolutionsField } from "./ai-experience/AIImplementedSolutionsField";
import { AIDesiredSolutionsField } from "./ai-experience/AIDesiredSolutionsField";
import { AIPreviousAttemptsField } from "./ai-experience/AIPreviousAttemptsField";
import { AIFormationQuestions } from "./ai-experience/AIFormationQuestions";
import { AINPSField } from "./ai-experience/AINPSField";
import { AISuggestionsField } from "./ai-experience/AISuggestionsField";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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
  implemented_solutions: string[];
  desired_solutions: string[];
  previous_attempts: string;
  completed_formation: boolean;
  is_member_for_month: boolean;
  nps_score: number;
  improvement_suggestions: string;
};

export const AIExperienceStep: React.FC<AIExperienceStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  // Extrair valores iniciais de forma mais robusta
  const getInitialValues = () => {
    console.log("Dados iniciais para AIExperience:", initialData);
    
    return {
      knowledge_level: initialData?.knowledge_level || "",
      previous_tools: initialData?.previous_tools || [],
      implemented_solutions: initialData?.implemented_solutions || [],
      desired_solutions: initialData?.desired_solutions || [],
      previous_attempts: initialData?.previous_attempts || "",
      completed_formation: initialData?.completed_formation || false,
      is_member_for_month: initialData?.is_member_for_month || false,
      nps_score: initialData?.nps_score || 5,
      improvement_suggestions: initialData?.improvement_suggestions || "",
    };
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AIExperienceFormValues>({
    defaultValues: getInitialValues()
  });

  // Atualizar formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      console.log("Atualizando formulário AIExperience com dados:", initialData);
      reset(getInitialValues());
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: AIExperienceFormValues) => {
    console.log("Enviando dados de experiência AI:", data);
    
    // Certificando-se de que o formato dos dados esteja correto
    onSubmit("ai_exp", { 
      ai_experience: {
        knowledge_level: data.knowledge_level,
        previous_tools: data.previous_tools,
        implemented_solutions: data.implemented_solutions,
        desired_solutions: data.desired_solutions,
        previous_attempts: data.previous_attempts,
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
            <AIImplementedSolutionsField control={control} error={errors.implemented_solutions} />
            <AIDesiredSolutionsField control={control} error={errors.desired_solutions} />
            <AIPreviousAttemptsField control={control} />
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
