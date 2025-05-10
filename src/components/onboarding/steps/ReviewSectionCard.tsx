
import React, { useMemo } from "react";
import { CheckCircle, PenSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingStep } from "@/types/onboarding";

// Importando os componentes de resumo para cada seção
import { getPersonalInfoSummary } from "./review-sections/personalInfoSummary";
import { getProfessionalDataSummary } from "./review-sections/professionalDataSummary";
import { getBusinessContextSummary } from "./review-sections/businessContextSummary";
import { getAIExperienceSummary } from "./review-sections/aiExperienceSummary";
import { getBusinessGoalsSummary } from "./review-sections/businessGoalsSummary";
import { getExperiencePersonalizationSummary } from "./review-sections/experiencePersonalizationSummary";
import { getComplementaryInfoSummary } from "./review-sections/complementaryInfoSummary";

// Função para determinar o componente de resumo correto com base na seção
const getSummaryComponent = (section: string, data: any, progress: any) => {
  console.log(`[ReviewSectionCard] Renderizando summary para seção ${section} com dados:`, data);
  
  // Verificações iniciais de sanidade dos dados
  if (!data) {
    console.warn(`[ReviewSectionCard] Dados NULOS para seção ${section}`);
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Verificar se é um objeto vazio
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    console.warn(`[ReviewSectionCard] Objeto vazio para seção ${section}`);
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Verificar se é uma string vazia ou "{}"
  if (typeof data === 'string' && (data === "" || data === "{}")) {
    console.warn(`[ReviewSectionCard] String vazia ou "{}" para seção ${section}`);
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Se data for uma string, tentar converter para objeto
  if (typeof data === 'string' && data !== "" && data !== "{}") {
    try {
      data = JSON.parse(data);
      console.log(`[ReviewSectionCard] Convertido string para objeto na seção ${section}:`, data);
    } catch (e) {
      console.error(`[ReviewSectionCard] Erro ao converter string para objeto na seção ${section}:`, e);
      return <p className="text-gray-500 italic">Erro ao processar dados. Clique em Editar para preencher novamente.</p>;
    }
  }
  
  // Verificação adicional após possível conversão
  if (typeof data === 'object' && Object.keys(data).length === 0) {
    console.warn(`[ReviewSectionCard] Objeto vazio após conversão para seção ${section}`);
    return <p className="text-gray-500 italic">Seção não preenchida. Clique em Editar para preencher.</p>;
  }
  
  // Selecionar o componente correto com base na seção
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
  // Verificar se há dados válidos na seção com tratamento de tipos
  const isCompleted = useMemo(() => {
    // Se não temos dados, obviamente não está completo
    if (!sectionData) {
      return false;
    }
    
    // Verificar se é uma string e tentar converter
    if (typeof sectionData === 'string') {
      if (sectionData === "" || sectionData === "{}") {
        return false;
      }
      
      // Tentar converter para objeto
      try {
        const parsedData = JSON.parse(sectionData);
        
        // Verificar se o objeto resultante tem dados
        if (!parsedData || Object.keys(parsedData).length === 0) {
          return false;
        }
        
        // Usar o objeto convertido para verificação específica de campos
        return checkSectionCompletion(step.section, parsedData);
      } catch (e) {
        console.error(`[ReviewSectionCard] Erro ao parsear dados da seção ${step.section}:`, e);
        return false;
      }
    }
    
    // Para objetos, verificar diretamente
    return checkSectionCompletion(step.section, sectionData);
  }, [step, sectionData]);
  
  // Função auxiliar para verificar critérios específicos de cada seção
  function checkSectionCompletion(section: string, data: any): boolean {
    // Verificações específicas por tipo de seção
    if (section === 'personal_info') {
      return !!data.name && !!data.email;
    }
    
    if (section === 'professional_info' || section === 'professional_data') {
      return !!data.company_name && !!data.company_size;
    }
    
    if (section === 'business_context') {
      return !!data.business_model;
    }
    
    if (section === 'ai_experience') {
      return !!data.knowledge_level;
    }
    
    if (section === 'business_goals') {
      // Verificação mais detalhada para business_goals
      return !!data.primary_goal;
    }
    
    if (section === 'experience_personalization') {
      return Array.isArray(data.interests) && data.interests.length > 0;
    }
    
    if (section === 'complementary_info') {
      return data.how_found_us !== undefined;
    }
    
    // Verificação genérica para outras seções
    return Object.keys(data).length > 0;
  }

  // Renderizar resumo com base na seção
  const sectionSummary = useMemo(() => {
    return getSummaryComponent(step.section, sectionData, progress);
  }, [step, sectionData, progress]);

  // Corrigir o índice da etapa para navegação
  // Precisamos corrigir o índice já que o stepIndex é 1-based para UI mas precisamos 0-based para arrays
  const handleEditClick = () => {
    console.log(`[ReviewSectionCard] Editando seção ${step.id} com índice UI ${stepIndex}, índice array ${stepIndex - 1}`);
    
    // Passar o índice exato correto (com base zero) para a função de navegação
    // O stepIndex é base-1 (começa em 1), mas arrays são base-0, então subtraímos 1
    navigateToStep(stepIndex - 1);
  };

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
            onClick={handleEditClick}
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
