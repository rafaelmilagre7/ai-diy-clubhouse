
import { Progress } from "@/lib/supabase";

/**
 * Calculate progress percentage based on completed modules
 */
export const calculateProgressPercentage = (completedModules: number[], modulesLength: number = 6): number => {
  if (!modulesLength) return 0;
  return Math.min(100, Math.round((completedModules.length / modulesLength) * 100));
};

/**
 * Check if user has interacted enough with a module to mark it as completed
 */
export const validateModuleInteraction = (
  hasInteracted: boolean,
  requireUserConfirmation: boolean
): { isValid: boolean; message?: string } => {
  if (!hasInteracted && requireUserConfirmation) {
    return {
      isValid: false,
      message: "Você precisa revisar o conteúdo completo antes de marcar como concluído."
    };
  }
  
  return { isValid: true };
};

/**
 * Log progress-related events with consistent formatting
 */
export const logProgressEvent = (
  log: (action: string, data: any) => void,
  event: string,
  data: any
) => {
  log(`Progress Tracking: ${event}`, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Check if a step in the implementation flow should be accessible
 */
export const validateStepAccess = (
  step: number,
  completedModules: number[],
  requireSequentialProgress: boolean = true
): { canAccess: boolean; message?: string } => {
  // Always allow access to first step
  if (step === 0) return { canAccess: true };
  
  // If sequential progress is required, check if previous step is completed
  if (requireSequentialProgress && !completedModules.includes(step - 1)) {
    return {
      canAccess: false,
      message: "Você precisa completar as etapas anteriores primeiro."
    };
  }
  
  return { canAccess: true };
};

/**
 * Get user-friendly step name based on module type
 */
export const getStepNameByType = (type: string): string => {
  const typeMap: Record<string, string> = {
    "landing": "Visão Geral",
    "overview": "Visão Geral",
    "preparation": "Ferramentas",
    "implementation": "Materiais",
    "verification": "Vídeos",
    "results": "Checklist",
    "optimization": "Conclusão",
    "celebration": "Conclusão"
  };
  
  return typeMap[type] || type;
};
