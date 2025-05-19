
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';
import { sanitizeTrailData, saveTrailToLocalStorage, getTrailFromLocalStorage, clearTrailFromLocalStorage } from './useImplementationTrail.utils';
import { toast } from 'sonner';

export interface ImplementationTrail {
  priority1: TrailSolution[];
  priority2: TrailSolution[];
  priority3: TrailSolution[];
  recommended_courses?: TrailCourseRecommendation[];
}

export interface TrailSolution {
  solutionId: string;
  justification?: string;
  priority?: number;
}

export interface TrailCourseRecommendation {
  courseId: string;
  justification?: string;
  priority?: number;
}

export const useImplementationTrail = () => {
  const { user } = useAuth();
  const [trail, setTrail] = useState<ImplementationTrail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasContent, setHasContent] = useState(false);
  
  // Referência para controlar chamadas duplicadas
  const pendingRequestRef = useRef<boolean>(false);
  const lastGeneratedRef = useRef<number>(0);

  // Carregar dados da trilha
  const loadTrailData = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Prevenir chamadas duplicadas
    if (pendingRequestRef.current) {
      console.log("Requisição já em andamento, ignorando chamada duplicada");
      return;
    }

    try {
      pendingRequestRef.current = true;
      setRefreshing(true);
      setError(null);

      let trailData;

      // Se não forçar atualização, tentar obter do armazenamento local primeiro
      if (!forceRefresh) {
        trailData = getTrailFromLocalStorage(user.id);
        
        if (trailData) {
          console.log("Usando dados da trilha do armazenamento local");
          setTrail(sanitizeTrailData(trailData.trail_data));
          setHasContent(true);
          setIsLoading(false);
          setRefreshing(false);
          pendingRequestRef.current = false;
          return;
        }
      }

      // Buscar do banco de dados
      const { data, error } = await supabase
        .from("implementation_trails")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum registro encontrado (código PGRST116), não é um erro real
          console.log("Nenhuma trilha encontrada para o usuário");
          setTrail(null);
          setHasContent(false);
        } else {
          console.error("Erro ao carregar trilha:", error);
          setError(error);
        }
      } else if (data) {
        const sanitizedData = sanitizeTrailData(data.trail_data);
        setTrail(sanitizedData);
        setHasContent(true);
        
        // Salvar no armazenamento local para uso futuro
        saveTrailToLocalStorage(user.id, data);
      }
    } catch (err) {
      console.error("Erro ao processar dados da trilha:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      pendingRequestRef.current = false;
    }
  }, [user]);

  // Efeito para carregar a trilha quando o componente é montado
  useEffect(() => {
    loadTrailData();
  }, [loadTrailData]);

  // Função para gerar trilha de implementação
  const generateImplementationTrail = useCallback(async (onboardingData = {}, forceRegenerate = false) => {
    if (!user) {
      toast.error("Você precisa estar logado para gerar uma trilha");
      return null;
    }
    
    // Prevenir chamadas duplicadas ou muito próximas (limitar a uma a cada 3 segundos)
    const now = Date.now();
    if (pendingRequestRef.current || (now - lastGeneratedRef.current < 3000 && !forceRegenerate)) {
      console.log("Requisição já em andamento ou muito recente, ignorando chamada duplicada");
      toast.info("Processando sua solicitação anterior, aguarde um momento...");
      return null;
    }
    
    try {
      pendingRequestRef.current = true;
      lastGeneratedRef.current = now;
      setRegenerating(true);
      setError(null);
      
      // Limpar dados locais da trilha
      clearTrailFromLocalStorage(user.id);
      
      // Verificar se já existe uma trilha e não está forçando regeneração
      if (!forceRegenerate) {
        const { data: existingTrail } = await supabase
          .from("implementation_trails")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (existingTrail) {
          // Se já existe uma trilha, retorná-la sem regenerar
          const sanitizedData = sanitizeTrailData(existingTrail.trail_data);
          setTrail(sanitizedData);
          setHasContent(true);
          
          // Salvar no armazenamento local
          saveTrailToLocalStorage(user.id, existingTrail);
          
          return sanitizedData;
        }
      }
      
      // Chamar a função de borda para gerar a trilha
      const { data, error } = await supabase.functions.invoke('generate-implementation-trail', {
        body: { 
          userId: user.id,
          hasOnboardingData: true,
          ...onboardingData
        }
      });
      
      if (error) throw error;
      
      if (!data || !data.success) {
        throw new Error(data?.message || "Falha ao gerar trilha de implementação");
      }
      
      // Atualizar estado com a nova trilha
      const sanitizedData = sanitizeTrailData(data.trail?.trail_data);
      setTrail(sanitizedData);
      setHasContent(true);
      
      // Salvar no armazenamento local
      if (data.trail) {
        saveTrailToLocalStorage(user.id, data.trail);
      }
      
      return sanitizedData;
    } catch (err) {
      console.error("Erro ao gerar trilha de implementação:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("Erro ao gerar trilha de implementação. Tente novamente.");
      return null;
    } finally {
      setRegenerating(false);
      // Atraso de 1 segundo antes de liberar o flag de pendência
      // para evitar chamadas muito rápidas sucessivas
      setTimeout(() => {
        pendingRequestRef.current = false;
      }, 1000);
    }
  }, [user]);

  // Função para atualizar a trilha
  const refreshTrail = useCallback(async (forceRefresh = false) => {
    await loadTrailData(forceRefresh);
  }, [loadTrailData]);

  return {
    trail,
    isLoading,
    error,
    hasContent,
    generateImplementationTrail,
    refreshTrail,
    regenerating,
    refreshing
  };
};
