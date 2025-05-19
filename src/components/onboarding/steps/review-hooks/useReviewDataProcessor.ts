
import { useState, useEffect, useMemo } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { ReviewData } from "@/types/reviewTypes";
import { toast } from "sonner";

/**
 * Hook para processar os dados de onboarding para o componente de revisão
 */
export const useReviewDataProcessor = (progress: OnboardingProgress | null) => {
  // Estado com tipagem explícita para dados processados
  const [processedData, setProcessedData] = useState<ReviewData | null>(null);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  
  // Efeito para processar dados quando progresso mudar
  useEffect(() => {
    if (!progress) {
      console.log("[ReviewStep] Dados não disponíveis:", { hasProgress: !!progress });
      setProcessingComplete(true);
      return;
    }
    
    try {
      console.log("[ReviewStep] Processando dados de progresso:", progress);
      
      // Função para normalizar campos que podem estar como string
      const normalizeField = (fieldName: string, value: any) => {
        if (typeof value === 'string' && fieldName !== 'current_step' && fieldName !== 'user_id' && fieldName !== 'id') {
          console.log(`[ReviewStep] Tentando normalizar campo ${fieldName} que está como string:`, value);
          
          // Tentativa de converter string para objeto
          try {
            if (value && value !== "{}" && value !== "") {
              const parsed = JSON.parse(value);
              console.log(`[ReviewStep] Campo ${fieldName} convertido de string para objeto:`, parsed);
              return parsed;
            }
          } catch (e) {
            console.error(`[ReviewStep] Falha ao converter string para objeto no campo ${fieldName}:`, e);
          }
        }
        return value;
      };
      
      // Criar uma cópia profunda do progresso para não modificar o original
      const normalizedProgress = JSON.parse(JSON.stringify(progress));
      
      // Verificar e normalizar campos principais
      const fieldsToNormalize = [
        'ai_experience', 
        'business_goals', 
        'experience_personalization', 
        'complementary_info',
        'professional_info', 
        'business_context',
        'personal_info'
      ];
      
      // Aplicar normalização a todos os campos listados
      fieldsToNormalize.forEach(field => {
        if (progress[field as keyof typeof progress]) {
          const normalizedValue = normalizeField(field, progress[field as keyof typeof progress]);
          (normalizedProgress as any)[field] = normalizedValue;
        }
      });
      
      console.log("[ReviewStep] Dados normalizados:", normalizedProgress);
      setProcessedData(normalizedProgress as ReviewData);
      
    } catch (error) {
      console.error("[ReviewStep] Erro ao processar dados:", error);
      toast.error("Erro ao processar dados de revisão. Algumas informações podem estar incompletas.");
    } finally {
      setProcessingComplete(true);
    }
  }, [progress]);

  // Usar dados processados ou fallback para dados originais
  const dataToUse = useMemo(() => {
    return processedData || progress;
  }, [processedData, progress]);

  return {
    processedData,
    processingComplete,
    dataToUse
  };
};
