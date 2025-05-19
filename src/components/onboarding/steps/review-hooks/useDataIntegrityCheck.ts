
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
        // Para personal_info, verificar se temos o nome preenchido
        hasData = !!(data[stepId]?.name || 
                    (typeof data[stepId] === 'object' && Object.keys(data[stepId] || {}).length > 0));
                    
        // Verificação extra: se o nome estiver diretamente no objeto principal
        if (!hasData && data.name) {
          hasData = true;
        }
      } else if (stepId === 'professional_info') {
        // Para professional_info, verificar campos específicos
        hasData = !!(data[stepId]?.company_name || 
                    (typeof data[stepId] === 'object' && Object.keys(data[stepId] || {}).length > 0));
                    
        // Verificar campos diretos como fallback
        if (!hasData && (data.company_name || data.current_position)) {
          hasData = true;
        }
      } else {
        // Para outros campos, verificar se o objeto existe e tem propriedades
        hasData = !!(data[stepId] && 
                    typeof data[stepId] === 'object' && 
                    Object.keys(data[stepId] || {}).length > 0);
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
