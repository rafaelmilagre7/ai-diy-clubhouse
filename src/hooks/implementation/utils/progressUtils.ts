
import { Progress } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";

/**
 * Calculate progress percentage based on completed modules
 */
export const calculateProgressPercentage = (completedModules: number[], modulesLength: number): number => {
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
