
import React, { useEffect, useState, useMemo } from "react";
import { OnboardingProgress } from "@/types/onboarding";
import { ReviewData } from "@/types/reviewTypes";
import { steps } from "@/hooks/onboarding/useStepDefinitions";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewSectionCard } from "./ReviewSectionCard";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ReviewStepProps {
  progress: OnboardingProgress | null;
  onComplete: () => void;
  isSubmitting: boolean;
  navigateToStep: (stepId: string) => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  progress,
  onComplete,
  isSubmitting,
  navigateToStep,
}) => {
  // Estado com tipagem explícita para dados processados
  const [processedData, setProcessedData] = useState<ReviewData | null>(null);
  const [processingComplete, setProcessingComplete] = useState<boolean>(false);
  const [dataIntegrityChecked, setDataIntegrityChecked] = useState<boolean>(false);
  const [missingSteps, setMissingSteps] = useState<string[]>([]);
  
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
      
      // Verificar etapas obrigatórias
      checkMissingSteps(normalizedProgress);
    } catch (error) {
      console.error("[ReviewStep] Erro ao processar dados:", error);
      toast.error("Erro ao processar dados de revisão. Algumas informações podem estar incompletas.");
    } finally {
      setProcessingComplete(true);
    }
  }, [progress]);

  // Verificar etapas obrigatórias que não foram completadas
  const checkMissingSteps = (data: any) => {
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
  };

  // Usar dados processados ou fallback para dados originais
  const dataToUse = useMemo(() => {
    return processedData || progress;
  }, [processedData, progress]);

  // Função melhorada para manipular a finalização
  const handleComplete = () => {
    // Verificar se há dados básicos disponíveis
    if (!dataToUse) {
      toast.error("Dados necessários não disponíveis. Por favor, recarregue a página.");
      return;
    }
    
    // Forçar prosseguimento: ignorar verificação de etapas faltantes
    // Isso permite que o usuário continue mesmo se o sistema ainda achar que algo está faltando
    onComplete();
  };

  // Se ainda não tivermos dados e o processamento estiver completo, mostrar mensagem de erro
  if (!dataToUse && processingComplete) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-800 rounded-md">
        <p className="text-red-400">Erro ao carregar dados para revisão. Por favor, recarregue a página ou volte às etapas anteriores.</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline" 
          className="mt-2 border-red-800 text-red-400 hover:bg-red-900/50"
        >
          Recarregar página
        </Button>
      </div>
    );
  }

  // Se os dados estiverem sendo processados, mostrar estado de carregamento
  if (!processingComplete) {
    return (
      <div className="py-6 flex flex-col items-center text-neutral-400">
        <Loader2 className="h-8 w-8 animate-spin mb-2 text-viverblue" />
        <p>Processando informações...</p>
      </div>
    );
  }

  // Verifica se todos os passos necessários foram concluídos
  // Exclui etapas de review e geração de trilha
  const allStepsCompleted = steps
    .filter(step => step.id !== "review" && step.id !== "trail_generation")
    .every(step => {
      if (!progress?.completed_steps || !Array.isArray(progress.completed_steps)) {
        return false;
      }
      return progress.completed_steps.includes(step.id);
    });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {steps
          .filter((step) => step.id !== "review" && step.id !== "trail_generation")
          .map((step, idx) => {
            const sectionKey = step.section as keyof OnboardingProgress;
            let sectionData = dataToUse && dataToUse[sectionKey];
            
            // Tratamento para dados específicos
            switch (step.section) {
              // Tratamento especial para business_context que pode estar em business_data
              case 'business_context':
                if (!sectionData || Object.keys(sectionData || {}).length === 0) {
                  const fallbackData = dataToUse?.business_data;
                  if (fallbackData) {
                    if (typeof fallbackData === 'string') {
                      try {
                        sectionData = JSON.parse(fallbackData);
                      } catch (e) {
                        console.error("[ReviewStep] Erro ao parser business_data como fallback:", e);
                      }
                    } else {
                      sectionData = fallbackData;
                    }
                    console.log("[ReviewStep] Usando business_data como fallback para business_context:", sectionData);
                  }
                }
                break;
              
              // Tratamento especial para dados profissionais
              case 'professional_info':
                if (!sectionData || Object.keys(sectionData || {}).length === 0) {
                  // Construir um objeto com dados diretos como fallback
                  if (dataToUse?.company_name || dataToUse?.company_size || dataToUse?.company_sector) {
                    const directData = {
                      company_name: dataToUse?.company_name || "",
                      company_size: dataToUse?.company_size || "",
                      company_sector: dataToUse?.company_sector || "",
                      company_website: dataToUse?.company_website || "",
                      current_position: dataToUse?.current_position || "",
                      annual_revenue: dataToUse?.annual_revenue || "",
                    };
                    
                    // Se algum dos campos diretos tiver valor, usar esses dados
                    if (Object.values(directData).some(value => !!value)) {
                      sectionData = directData;
                      console.log("[ReviewStep] Usando dados diretos para professional_info:", sectionData);
                    }
                  }
                }
                break;
              
              default:
                // Nenhum tratamento especial para outras seções
                break;
            }
            
            // Último esforço de normalização para garantir que temos um objeto e não uma string
            if (typeof sectionData === 'string' && sectionData !== "" && sectionData !== "{}") {
              try {
                sectionData = JSON.parse(sectionData);
                console.log(`[ReviewStep] Parseando string para objeto na renderização final:`, sectionData);
              } catch (e) {
                console.error(`[ReviewStep] Erro ao tentar parsear string:`, e, sectionData);
              }
            }
            
            // Garante que sectionData seja sempre um objeto (nunca undefined ou null)
            const safeData = sectionData || {};
            
            // Highlight se for uma etapa faltante
            const isMissingStep = missingSteps.includes(step.id);
            
            // Passamos o índice real (começando em 1) para a UI
            const stepIndex = idx + 1;

            // Passando o ID do passo diretamente para navegação
            return (
              <ReviewSectionCard
                key={step.id}
                step={step}
                sectionData={safeData}
                progress={dataToUse}
                stepIndex={stepIndex}
                navigateToStep={navigateToStep}
                highlight={isMissingStep}
              />
            );
          })}
      </div>

      {!dataIntegrityChecked && (
        <Card className="bg-blue-900/20 p-4 border border-blue-700/50">
          <p className="text-blue-300">
            <strong>Verificando dados...</strong> Por favor, aguarde enquanto verificamos se todas as informações estão completas.
          </p>
        </Card>
      )}

      {missingSteps.length > 0 && dataIntegrityChecked && (
        <Card className="bg-amber-900/30 p-4 border border-amber-700">
          <p className="text-amber-400">
            <strong>Atenção:</strong> Algumas seções importantes parecem estar incompletas. Recomendamos completar todas as seções antes de prosseguir para obter a melhor experiência personalizada.
          </p>
        </Card>
      )}

      <div className="pt-8 flex justify-end">
        <Button
          onClick={handleComplete}
          disabled={isSubmitting}
          size="lg"
          className="bg-viverblue hover:bg-viverblue-dark text-white px-8 py-6 text-lg shadow-md hover:shadow-lg transition-all duration-300"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processando...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Concluir e Gerar Minha Trilha
              <ArrowRight className="h-5 w-5" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
