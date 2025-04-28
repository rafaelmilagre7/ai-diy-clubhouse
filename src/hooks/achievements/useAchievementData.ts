
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData, SolutionData, isSolutionsArray } from "@/types/achievementTypes";
import { Solution } from "@/types/solution";
import { 
  fetchProgressData, 
  fetchBadgesData, 
  fetchChecklistData,
  fetchSocialData
} from "./utils/achievementUtils";

// Interface para os dados em cache
interface CachedData {
  timestamp: number;
  data: any;
}

// Cache para reduzir consultas ao banco de dados
const dataCache: Record<string, CachedData> = {
  progressData: { timestamp: 0, data: null },
  solutions: { timestamp: 0, data: null },
  checklistData: { timestamp: 0, data: null },
  badgesData: { timestamp: 0, data: null },
  socialData: { timestamp: 0, data: null }
};

// Tempo de validade do cache em ms (5 minutos)
const CACHE_TTL = 5 * 60 * 1000; 

// Função para verificar se o cache é válido
const isCacheValid = (key: string): boolean => {
  return (
    dataCache[key]?.data !== null && 
    dataCache[key]?.timestamp > 0 && 
    Date.now() - dataCache[key].timestamp < CACHE_TTL
  );
};

export const useAchievementData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistData[]>([]);
  const [badgesData, setBadgesData] = useState<BadgeData[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const subscriptionsRef = useRef<any[]>([]);
  const isInitialFetchRef = useRef(true);
  const lastFetchTimestampRef = useRef<number>(0);
  const realtimeUpdatePendingRef = useRef(false);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para buscar dados de conquistas com throttling e cache
  const fetchData = useCallback(async (force = false) => {
    if (!user?.id) return;

    // Evitar múltiplas requisições em sequência rápida (throttle)
    const now = Date.now();
    if (!force && now - lastFetchTimestampRef.current < 2000) {
      console.log('Ignorando requisição muito próxima da anterior');
      
      // Programar uma única atualização para depois
      if (fetchTimeoutRef.current === null) {
        fetchTimeoutRef.current = setTimeout(() => {
          fetchTimeoutRef.current = null;
          fetchData(true);
        }, 2000);
      }
      
      return;
    }

    lastFetchTimestampRef.current = now;

    try {
      console.log('Iniciando busca de dados de conquistas para usuário:', user.id);
      
      // Só mostra loading na primeira carga, ou se for uma carga forçada
      if (isInitialFetchRef.current || force) {
        setLoading(true);
      }
      
      setError(null);

      // Buscar soluções publicadas (com cache)
      let solutionsData;
      if (!force && isCacheValid('solutions')) {
        solutionsData = dataCache.solutions.data;
        console.log('Usando cache para soluções');
      } else {
        const { data, error: solutionsError } = await supabase
          .from("solutions")
          .select("*")
          .eq("published", true);

        if (solutionsError) throw solutionsError;
        solutionsData = data || [];
        
        // Atualizar cache
        dataCache.solutions = {
          timestamp: Date.now(),
          data: solutionsData
        };
      }
      
      console.log('Soluções encontradas:', solutionsData?.length || 0);
      setSolutions(solutionsData || []);

      // Buscar progresso do usuário (com cache)
      let progressResult;
      if (!force && isCacheValid('progressData')) {
        progressResult = dataCache.progressData.data;
        console.log('Usando cache para dados de progresso');
      } else {
        progressResult = await fetchProgressData(user.id);
        
        // Atualizar cache
        dataCache.progressData = {
          timestamp: Date.now(),
          data: progressResult
        };
      }
      
      console.log('Progresso encontrado:', progressResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface ProgressData
      const adaptedProgressData: ProgressData[] = (progressResult || []).map((item: any) => {
        // Converter solutions para o formato correto, seja objeto único ou um array
        let solutionsData: SolutionData | SolutionData[] | undefined = undefined;
        
        if (item.solutions) {
          if (Array.isArray(item.solutions)) {
            solutionsData = item.solutions.map((sol: any) => ({
              id: sol?.id || '',
              category: sol?.category || '',
              title: sol?.title || undefined
            }));
          } else {
            const solData = item.solutions as any;
            solutionsData = {
              id: solData?.id || '',
              category: solData?.category || '',
              title: solData?.title || undefined
            };
          }
        }
        
        return {
          id: item.id || '',
          user_id: item.user_id || '',
          solution_id: item.solution_id || '',
          current_module: item.current_module || 0,
          is_completed: item.is_completed || false,
          completed_at: item.completed_at,
          created_at: item.created_at || new Date().toISOString(),
          last_activity: item.last_activity,
          completed_modules: item.completed_modules,
          solutions: solutionsData
        };
      });
      
      setProgressData(adaptedProgressData);

      // Buscar checklists completados (com cache)
      let checklistResult;
      if (!force && isCacheValid('checklistData')) {
        checklistResult = dataCache.checklistData.data;
        console.log('Usando cache para dados de checklist');
      } else {
        checklistResult = await fetchChecklistData(user.id);
        
        // Atualizar cache
        dataCache.checklistData = {
          timestamp: Date.now(),
          data: checklistResult
        };
      }
      
      console.log('Checklists encontrados:', checklistResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface ChecklistData
      const adaptedChecklistData: ChecklistData[] = (checklistResult || []).map((item: any) => ({
        id: item.id || '',
        user_id: item.user_id || '',
        solution_id: item.solution_id || '',
        checklist_id: item.checklist_id,
        checked_items: item.checked_items || {},
        is_completed: item.is_completed || false,
        completed_at: item.completed_at
      }));
      
      setChecklistData(adaptedChecklistData);

      // Buscar badges conquistadas (com cache)
      let badgesResult;
      if (!force && isCacheValid('badgesData')) {
        badgesResult = dataCache.badgesData.data;
        console.log('Usando cache para dados de badges');
      } else {
        badgesResult = await fetchBadgesData(user.id);
        
        // Atualizar cache
        dataCache.badgesData = {
          timestamp: Date.now(),
          data: badgesResult
        };
      }
      
      console.log('Badges encontrados:', badgesResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface BadgeData
      const adaptedBadgesData: BadgeData[] = (badgesResult || []).map((item: any) => {
        const badgeInfo = item.badges || { 
          id: '', 
          name: '', 
          description: '', 
          icon: '', 
          category: '' 
        };
        
        return {
          id: item.id || '',
          user_id: user.id,
          badge_id: item.badge_id || '',
          earned_at: item.earned_at || new Date().toISOString(),
          badges: badgeInfo
        };
      });
      
      setBadgesData(adaptedBadgesData);
      
      // Buscar dados sociais (comentários e likes) (com cache)
      let socialData;
      if (!force && isCacheValid('socialData')) {
        socialData = dataCache.socialData.data;
        console.log('Usando cache para dados sociais');
      } else {
        socialData = await fetchSocialData(user.id);
        
        // Atualizar cache
        dataCache.socialData = {
          timestamp: Date.now(),
          data: socialData
        };
      }
      
      setComments(socialData.comments || []);
      setTotalLikes(socialData.totalLikes || 0);
      console.log('Dados sociais encontrados:', 
        'Comentários:', socialData.comments?.length || 0, 
        'Likes:', socialData.totalLikes || 0
      );

      console.log('Dados carregados com sucesso para gamificação');
      isInitialFetchRef.current = false;
      realtimeUpdatePendingRef.current = false;

    } catch (error: any) {
      console.error("Error in fetching achievements data:", error);
      setError("Ocorreu um erro ao carregar os dados de conquistas");
      
      if (!isInitialFetchRef.current) {
        toast({
          title: "Erro ao atualizar dados de conquistas",
          description: error.message || "Tente novamente mais tarde",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Função para limpar todas as inscrições existentes
  const clearSubscriptions = useCallback(() => {
    console.log('Limpando inscrições anteriores:', subscriptionsRef.current.length);
    
    subscriptionsRef.current.forEach(subscription => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    
    subscriptionsRef.current = [];
  }, []);

  // Limpar cache quando o usuário muda
  useEffect(() => {
    if (user?.id) {
      // Verificar se o usuário mudou
      const currentUserId = localStorage.getItem('current_achievement_user');
      
      if (currentUserId !== user.id) {
        // Usuário diferente, limpar cache
        Object.keys(dataCache).forEach(key => {
          dataCache[key] = { timestamp: 0, data: null };
        });
        
        localStorage.setItem('current_achievement_user', user.id);
      }
    }
  }, [user?.id]);

  // Inscrever-se para atualizações em tempo real
  const subscribeToUpdates = useCallback(() => {
    if (!user?.id) return;
    
    // Limpar inscrições anteriores antes de criar novas
    clearSubscriptions();
    
    console.log('Configurando inscrições em tempo real para:', user.id);
    
    // Função para lidar com atualizações recebidas
    const handleUpdate = () => {
      // Se uma atualização já estiver pendente, ignoramos essa
      if (realtimeUpdatePendingRef.current) {
        console.log('Atualização já pendente, ignorando trigger');
        return;
      }
      
      console.log('Atualização detectada via Realtime - atualizando dados');
      realtimeUpdatePendingRef.current = true;
      
      // Limpar cache para forçar recarregamento
      const keysToInvalidate = ['progressData', 'badgesData', 'checklistData'];
      keysToInvalidate.forEach(key => {
        dataCache[key] = { timestamp: 0, data: null };
      });
      
      // Pequeno delay para evitar múltiplas atualizações simultâneas
      setTimeout(() => fetchData(true), 500);
    };
    
    // Inscrição para mudanças na tabela progress
    const progressSubscription = supabase
      .channel('progress-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'progress',
          filter: `user_id=eq.${user.id}`
        }, 
        handleUpdate
      )
      .subscribe();
    
    // Inscrição para mudanças na tabela user_badges
    const badgesSubscription = supabase
      .channel('badges-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        }, 
        handleUpdate
      )
      .subscribe();
      
    // Inscrição para mudanças na tabela user_checklists
    const checklistSubscription = supabase
      .channel('checklists-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_checklists',
          filter: `user_id=eq.${user.id}`
        }, 
        handleUpdate
      )
      .subscribe();
    
    // Inscrição para mudanças na tabela solution_comments
    const commentsSubscription = supabase
      .channel('comments-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'solution_comments',
          filter: `user_id=eq.${user.id}`
        }, 
        handleUpdate
      )
      .subscribe();
    
    // Inscrição para mudanças na tabela solution_comment_likes
    const likesSubscription = supabase
      .channel('likes-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'solution_comment_likes',
          filter: `user_id=eq.${user.id}`
        }, 
        handleUpdate
      )
      .subscribe();
    
    subscriptionsRef.current = [
      progressSubscription,
      badgesSubscription,
      checklistSubscription,
      commentsSubscription,
      likesSubscription
    ];
    
    console.log('Inscrições em tempo real configuradas com sucesso');
    
    return clearSubscriptions;
  }, [user?.id, fetchData, clearSubscriptions]);

  // Efeito para carregar dados iniciais e configurar inscrições
  useEffect(() => {
    console.log('useAchievementData useEffect triggered');
    fetchData(true);
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      if (unsubscribe) unsubscribe();
      
      // Limpar timeout pendente
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
    };
  }, [fetchData, subscribeToUpdates]);

  // Forçar atualização quando a página é reativada
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Verificar se o cache está expirado
        const needsRefresh = Object.keys(dataCache).some(
          key => !isCacheValid(key)
        );
        
        if (needsRefresh) {
          console.log('Página reativada e cache expirado, atualizando dados');
          fetchData(true);
        } else {
          console.log('Página reativada, mas cache ainda é válido');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  return {
    loading,
    error,
    refetch: () => fetchData(true),
    progressData,
    solutions,
    checklistData,
    badgesData,
    comments,
    totalLikes
  };
};
