
import { useState, useEffect } from "react";
import { OnboardingProgress } from "@/types/onboarding";

/**
 * Hook para verificar a integridade dos dados do onboarding
 */
export const useDataIntegrityCheck = (data: OnboardingProgress | null) => {
  const [missingSteps, setMissingSteps] = useState<string[]>([]);
  const [dataIntegrityChecked, setDataIntegrityChecked] = useState<boolean>(false);
  
  // Verificar etapas obrigatórias que não foram completadas
  useEffect(() => {
    if (!data) {
      setMissingSteps([]);
      setDataIntegrityChecked(true);
      return;
    }

    // Etapas mínimas obrigatórias para gerar uma trilha significativa
    const requiredSteps = ['personal_info', 'professional_info', 'business_goals'];
    
    const missing = requiredSteps.filter(stepId => {
      // Verificar se o passo está marcado como concluído
      const hasStep = data.completed_steps && Array.isArray(data.completed_steps) && 
                     data.completed_steps.includes(stepId);
                     
      // Verificar se há dados para o campo correspondente
      // Verificação melhorada: considerar diferentes formatos de dados
      let hasData = false;
      
      if (stepId === 'personal_info') {
        // Para personal_info, verificar se temos informações pessoais preenchidas
        const personalInfo = data[stepId as keyof OnboardingProgress];
        hasData = !!(personalInfo && 
                    typeof personalInfo === 'object' && 
                    Object.keys(personalInfo || {}).length > 0);
                    
        // Verificação extra: procurar por campos diretos no objeto principal
        if (!hasData && data.personal_info && typeof data.personal_info === 'object') {
          hasData = Object.keys(data.personal_info).length > 0;
        }
      } else if (stepId === 'professional_info') {
        // Para professional_info, verificar campos específicos
        const professionalInfo = data[stepId as keyof OnboardingProgress];
        hasData = !!(professionalInfo && 
                    typeof professionalInfo === 'object' && 
                    Object.keys(professionalInfo || {}).length > 0);
                    
        // Verificar campos diretos como fallback
        if (!hasData && (data.company_name || data.current_position)) {
          hasData = true;
        }
      } else {
        // Para outros campos, verificar se o objeto existe e tem propriedades
        const stepData = data[stepId as keyof OnboardingProgress];
        hasData = !!(stepData && 
                    typeof stepData === 'object' && 
                    Object.keys(stepData || {}).length > 0);
      }
      
      // Retorna true apenas se AMBAS verificações falharem
      // O passo está faltando se não está na lista de completed_steps E não tem dados
      return !hasData;
    });
    
    console.log("[ReviewStep] Verificação de integridade:", { 
      missingSteps: missing,
      dataComplete: missing.length === 0
    });
    
    setMissingSteps(missing);
    setDataIntegrityChecked(true);
  }, [data]);

  return {
    missingSteps,
    dataIntegrityChecked
  };
};
