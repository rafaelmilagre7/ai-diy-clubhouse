
import React, { useMemo } from "react";
import { CheckCircle, PenSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingStep } from "@/types/onboarding";
import { getPersonalInfoSummary } from "./review-sections/personalInfoSummary";
import { getProfessionalDataSummary } from "./review-sections/professionalDataSummary";
import { getBusinessContextSummary } from "./review-sections/businessContextSummary";
import { getAIExperienceSummary } from "./review-sections/aiExperienceSummary";
import { getBusinessGoalsSummary } from "./review-sections/businessGoalsSummary";
import { getExperiencePersonalizationSummary } from "./review-sections/experiencePersonalizationSummary";
import { getComplementaryInfoSummary } from "./review-sections/complementaryInfoSummary";

// Função para determinar o componente de resumo correto com base na seção
const getSummaryComponent = (section: string, data: any, progress: any) => {
  console.log(`Renderizando summary para seção ${section} com dados:`, data);
  
  if (!data || Object.keys(data).length === 0) {
    console.warn(`Dados vazios para seção ${section}`);
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  switch (section) {
    case "personal_info":
      return getPersonalInfoSummary(data);
    case "professional_info":
    case "professional_data":
      return getProfessionalDataSummary(data);
    case "business_context":
      return getBusinessContextSummary(data);
    case "ai_experience":
      return getAIExperienceSummary(data);
    case "business_goals":
      return getBusinessGoalsSummary(data);
    case "experience_personalization":
      return getExperiencePersonalizationSummary(data);
    case "complementary_info":
      return getComplementaryInfoSummary(data);
    default:
      return <p>Seção não reconhecida.</p>;
  }
};

interface ReviewSectionCardProps {
  step: OnboardingStep;
  sectionData: any;
  progress: any;
  stepIndex: number;
  navigateToStep: (index: number) => void;
}

export const ReviewSectionCard: React.FC<ReviewSectionCardProps> = ({
  step,
  sectionData,
  progress,
  stepIndex,
  navigateToStep,
}) => {
  // Verificar se há dados válidos na seção
  const isCompleted = useMemo(() => {
    // Verificando detalhadamente os dados da seção
    console.log(`Revisando dados para seção ${step.section}:`, sectionData);
    
    // Para análise de dados específicos
    if (step.section === 'personal_info') {
      return !!sectionData.name && !!sectionData.email;
    }
    
    if (step.section === 'professional_info' || step.section === 'professional_data') {
      return !!sectionData.company_name && !!sectionData.company_size;
    }
    
    if (step.section === 'business_context') {
      return !!sectionData.business_model;
    }
    
    if (step.section === 'ai_experience') {
      return !!sectionData.knowledge_level;
    }
    
    if (step.section === 'business_goals') {
      // Verificação mais específica para business_goals
      return !!sectionData.primary_goal && 
             !!sectionData.priority_solution_type &&
             !!sectionData.how_implement &&
             !!sectionData.week_availability;
    }
    
    // Verificação genérica para outras seções
    return Object.keys(sectionData).length > 0;
  }, [step, sectionData]);

  // Renderizar resumo com base na seção
  const sectionSummary = useMemo(() => {
    return getSummaryComponent(step.section, sectionData, progress);
  }, [step, sectionData, progress]);

  return (
    <Card className="overflow-hidden border-l-4 border-l-gray-200">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50 py-2 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-foreground">
            <span className="text-sm font-medium">{stepIndex}</span>
          </div>
          <CardTitle className="text-lg font-medium">{step.title}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="flex items-center text-green-600">
              <CheckCircle className="mr-1 h-4 w-4" />
              <span className="text-xs">Completo</span>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => navigateToStep(stepIndex - 1)}
          >
            <PenSquare className="h-4 w-4" />
            <span>Editar</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">{sectionSummary}</CardContent>
    </Card>
  );
};
