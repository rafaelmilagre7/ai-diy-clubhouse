
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToastModern } from "@/hooks/useToastModern";
import { useUserStats } from "@/hooks/useUserStats";

export interface Implementation {
  id: string;
  solution: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
  };
  current_module: number;
  is_completed: boolean;
  completed_at?: string;
  last_activity?: string;
}

// CORREÇÃO BUG MÉDIO 1: Implementação de retry automático com backoff exponencial e jitter
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 [PROFILE] Tentativa ${attempt}/${maxRetries} para ${operationName}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ [PROFILE] Tentativa ${attempt} falhou para ${operationName}:`, error);
      
      // Se é a última tentativa, não aguardar
      if (attempt === maxRetries) {
        break;
      }
      
      // Verificar se é erro de rede (retryable)
      const isNetworkError = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('timeout') ||
        error.message.includes('connection')
      );
      
      // Apenas tentar novamente se for erro de rede
      if (isNetworkError) {
        // CORREÇÃO: Backoff exponencial com jitter para prevenir thundering herd
        const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 4000);
        const jitter = Math.random() * 500; // 0ms a 500ms conforme solicitado
        const delay = baseDelay + jitter;
        
        console.log(`🔄 [PROFILE] Aguardando ${Math.round(delay)}ms (base: ${baseDelay}ms + jitter: ${Math.round(jitter)}ms) antes da próxima tentativa`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Se não é erro de rede, falhar imediatamente
        console.log(`❌ [PROFILE] Erro não relacionado à rede, não tentando novamente`);
        break;
      }
    }
  }
  
  // Se chegou aqui, todas as tentativas falharam
  console.error(`❌ [PROFILE] Todas as tentativas falharam para ${operationName}:`, lastError!);
  throw lastError!;
};

export const useProfileData = () => {
  const { user, profile } = useAuth();
  const { showError } = useToastModern();
  const { stats, loading: statsLoading } = useUserStats();
  
  const [loading, setLoading] = useState(true);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log(`🔍 [PROFILE] Iniciando busca de dados para usuário: ${user.id.substring(0, 8)}***`);
        
        // CORREÇÃO: Usar executeWithRetry para robustez de rede com jitter
        await executeWithRetry(async () => {
          // Fetch user's completed or in-progress solutions
          const { data: progressData, error: progressError } = await supabase
            .from("progress")
            .select(`
              *,
              solution:solution_id (
                id, title, category, difficulty
              )
            `)
            .eq("user_id", user.id);
          
          if (progressError) {
            console.error("❌ [PROFILE] Erro ao buscar progresso:", progressError);
            // Use mock data in case of error
            setImplementations([
              {
                id: "1",
                solution: {
                  id: "s1",
                  title: "Assistente de IA no WhatsApp",
                  category: "operational",
                  difficulty: "easy",
                },
                current_module: 2,
                is_completed: false,
              }
            ]);
            console.log("📊 [PROFILE] Usando dados mock devido ao erro");
          } else {
            const formattedImplementations = progressData?.map(item => ({
              id: item.id,
              solution: item.solution,
              current_module: item.current_module,
              is_completed: item.is_completed,
              completed_at: item.completed_at,
              last_activity: item.last_activity
            })) || [];
            
            setImplementations(formattedImplementations);
            console.log(`✅ [PROFILE] ${formattedImplementations.length} implementações carregadas com sucesso`);
          }
          
          return true; // Operação bem-sucedida
        }, "buscar dados do usuário");
        
      } catch (error) {
        console.error("❌ [PROFILE] Erro final após todas as tentativas:", error);
        
        // Mostrar toast de erro apenas após esgotar tentativas
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados após várias tentativas. Tente novamente mais tarde.",
          variant: "destructive",
        });
        
        // Usar dados mock como fallback
        setImplementations([
          {
            id: "1",
            solution: {
              id: "s1",
              title: "Assistente de IA no WhatsApp",
              category: "operational",
              difficulty: "easy",
            },
            current_module: 2,
            is_completed: false,
          }
        ]);
        console.log("📊 [PROFILE] Usando dados mock como fallback final");
      } finally {
        setLoading(false);
        console.log("✅ [PROFILE] Busca de dados finalizada, loading = false");
      }
    };
    
    fetchUserData();
  }, [user, toast]);
  
  return {
    loading: loading || statsLoading,
    profile,
    stats,
    implementations
  };
};
