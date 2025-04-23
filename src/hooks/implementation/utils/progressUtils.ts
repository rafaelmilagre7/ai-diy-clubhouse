
import { supabase } from "@/lib/supabase";

// Calcular porcentagem de progresso
export const calculateProgressPercentage = (
  completedModules: number[],
  totalModules: number
): number => {
  if (!totalModules || totalModules <= 0) return 0;
  return Math.round((completedModules.length / totalModules) * 100);
};

// Registrar eventos de progresso para análise
export const logProgressEvent = async (
  userId: string,
  solutionId: string,
  eventType: string,
  eventData: Record<string, any> = {}
) => {
  try {
    await supabase.from("analytics").insert({
      user_id: userId,
      solution_id: solutionId,
      event_type: eventType,
      event_data: {
        ...eventData,
        timestamp: new Date().toISOString()
      }
    });
    return true;
  } catch (error) {
    console.error("Erro ao registrar evento de progresso:", error);
    return false;
  }
};
