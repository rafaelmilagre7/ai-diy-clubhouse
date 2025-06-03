
import { useState, useCallback } from "react";
import { useLogging } from "@/hooks/useLogging";

interface ValidationResult {
  isValid: boolean;
  message?: string;
  requirement?: string;
}

interface SectionValidations {
  tools: ValidationResult;
  materials: ValidationResult;
  videos: ValidationResult;
  checklist: ValidationResult;
}

export const useValidations = () => {
  const [validations, setValidations] = useState<SectionValidations>({
    tools: { isValid: false, message: "Explore pelo menos 2 ferramentas para continuar" },
    materials: { isValid: false, message: "Baixe pelo menos 1 material para continuar" },
    videos: { isValid: false, message: "Assista pelo menos 1 vídeo completo para continuar" },
    checklist: { isValid: false, message: "Complete pelo menos 80% dos itens para continuar" }
  });
  
  const { log } = useLogging();

  const validateToolsSection = useCallback((interactionCount: number, timeSpent: number) => {
    const isValid = interactionCount >= 2 && timeSpent >= 30; // pelo menos 2 interações e 30 segundos
    const result = {
      isValid,
      message: isValid ? undefined : `Explore pelo menos 2 ferramentas e passe pelo menos 30 segundos na seção (${interactionCount}/2 ferramentas, ${Math.round(timeSpent)}s)`,
      requirement: "Interaja com pelo menos 2 ferramentas"
    };
    
    setValidations(prev => ({ ...prev, tools: result }));
    log("Tools section validation", { interactionCount, timeSpent, isValid });
    return result;
  }, [log]);

  const validateMaterialsSection = useCallback((downloadCount: number, timeSpent: number) => {
    const isValid = downloadCount >= 1 && timeSpent >= 60; // pelo menos 1 download e 1 minuto
    const result = {
      isValid,
      message: isValid ? undefined : `Baixe pelo menos 1 material e revise o conteúdo por pelo menos 1 minuto (${downloadCount}/1 downloads, ${Math.round(timeSpent)}s)`,
      requirement: "Baixe pelo menos 1 material"
    };
    
    setValidations(prev => ({ ...prev, materials: result }));
    log("Materials section validation", { downloadCount, timeSpent, isValid });
    return result;
  }, [log]);

  const validateVideosSection = useCallback((watchedCount: number, totalWatchTime: number) => {
    const isValid = watchedCount >= 1 && totalWatchTime >= 120; // pelo menos 1 vídeo e 2 minutos
    const result = {
      isValid,
      message: isValid ? undefined : `Assista pelo menos 1 vídeo completo (${watchedCount}/1 vídeos, ${Math.round(totalWatchTime/60)}min assistidos)`,
      requirement: "Assista pelo menos 1 vídeo completo"
    };
    
    setValidations(prev => ({ ...prev, videos: result }));
    log("Videos section validation", { watchedCount, totalWatchTime, isValid });
    return result;
  }, [log]);

  const validateChecklistSection = useCallback((checkedItems: number, totalItems: number) => {
    const completionRate = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
    const isValid = completionRate >= 80; // pelo menos 80% completo
    const result = {
      isValid,
      message: isValid ? undefined : `Complete pelo menos 80% dos itens do checklist (${Math.round(completionRate)}% completo)`,
      requirement: "Complete pelo menos 80% do checklist"
    };
    
    setValidations(prev => ({ ...prev, checklist: result }));
    log("Checklist section validation", { checkedItems, totalItems, completionRate, isValid });
    return result;
  }, [log]);

  const getSectionValidation = useCallback((sectionId: string) => {
    return validations[sectionId as keyof SectionValidations];
  }, [validations]);

  const isAllValid = useCallback(() => {
    return Object.values(validations).every(v => v.isValid);
  }, [validations]);

  return {
    validations,
    validateToolsSection,
    validateMaterialsSection,
    validateVideosSection,
    validateChecklistSection,
    getSectionValidation,
    isAllValid
  };
};
