
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData, SolutionData } from "@/types/achievementTypes";
import { Solution } from "@/types/solution";
import { 
  fetchProgressData, 
  fetchBadgesData, 
  fetchChecklistData,
  fetchSocialData
} from "./utils/achievementUtils";

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

  // Função para buscar dados de conquistas
  const fetchData = useCallback(async (force = false) => {
    if (!user?.id) return;

    // Evitar múltiplas requisições em sequência rápida (throttle)
    const now = Date.now();
    if (!force && now - lastFetchTimestampRef.current < 2000) {
      console.log('Ignorando requisição muito próxima da anterior');
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

      // Buscar soluções publicadas usando join para otimizar
      const { data: solutionsData, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) throw solutionsError;
      console.log('Soluções encontradas:', solutionsData?.length || 0);
      setSolutions(solutionsData || []);

      // Buscar progresso do usuário com join otimizado
      const progressResult = await fetchProgressData(user.id);
      console.log('Progresso encontrado:', progressResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface ProgressData
      const adaptedProgressData: ProgressData[] = (progressResult || []).map(item => {
        // Converter solutions para o formato correto, seja objeto único ou um array
        let solutionsData: SolutionData | SolutionData[] | undefined = undefined;
        
        if (item.solutions) {
          if (Array.isArray(item.solutions)) {
            // Se for um array, garantir que cada elemento tenha os campos necessários
            solutionsData = item.solutions.map((sol: any) => ({
              id: sol?.id || '',
              category: sol?.category || '',
              title: sol?.title
            }));
          } else {
            // Se for um objeto único
            solutionsData = {
              id: item.solutions?.id || '',
              category: item.solutions?.category || '',
              title: item.solutions?.title
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

      // Buscar checklists completados
      const checklistResult = await fetchChecklistData(user.id);
      console.log('Checklists encontrados:', checklistResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface ChecklistData
      const adaptedChecklistData: ChecklistData[] = (checklistResult || []).map(item => ({
        id: item.id || '',
        user_id: item.user_id || '',
        solution_id: item.solution_id || '',
        checklist_id: item.checklist_id, // Pode ser undefined
        checked_items: item.checked_items || {},
        is_completed: item.is_completed || false,
        completed_at: item.completed_at
      }));
      
      setChecklistData(adaptedChecklistData);

      // Buscar badges conquistadas
      const badgesResult = await fetchBadgesData(user.id);
      console.log('Badges encontrados:', badgesResult?.length || 0);
      
      // Adaptador para garantir compatibilidade com a interface BadgeData
      const adaptedBadgesData: BadgeData[] = (badgesResult || []).map(item => ({
        id: item.id || '',
        user_id: user.id, // Usando o ID do usuário atual
        badge_id: item.badge_id || '',
        earned_at: item.earned_at || new Date().toISOString(),
        badges: item.badges || { id: '', name: '', description: '', icon: '', category: '' }
      }));
      
      setBadgesData(adaptedBadgesData);
      
      // Buscar dados sociais (comentários e likes)
      const socialData = await fetchSocialData(user.id);
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
      
      // Pequeno delay para evitar múltiplas atualizações simultâneas
      setTimeout(() => fetchData(), 500);
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
    };
  }, [fetchData, subscribeToUpdates]);

  // Forçar atualização quando a página é reativada
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Página reativada, atualizando dados');
        fetchData(true);
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
