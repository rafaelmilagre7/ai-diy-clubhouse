
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData } from "@/types/achievementTypes";
import { Solution } from "@/types/solution";

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
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  // Função para buscar dados de conquistas
  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('Iniciando busca de dados de conquistas para usuário:', user.id);
      setLoading(true);
      setError(null);

      // Buscar soluções publicadas usando join para otimizar
      const { data: solutionsData, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) {
        console.error("Erro ao buscar soluções:", solutionsError);
        throw solutionsError;
      }
      console.log('Soluções encontradas:', solutionsData?.length || 0);
      setSolutions(solutionsData || []);

      // Buscar progresso do usuário com join otimizado
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select(`
          *,
          solutions:solution_id (id, category)
        `)
        .eq("user_id", user.id);

      if (progressError) {
        console.error("Erro ao buscar progresso:", progressError);
        throw progressError;
      }
      console.log('Progresso encontrado:', progressData?.length || 0);
      setProgressData(progressData || []);

      // Buscar checklists completados
      const { data: checklistData, error: checklistError } = await supabase
        .from("user_checklists")
        .select("*")
        .eq("user_id", user.id);

      if (checklistError) {
        console.error("Erro ao buscar checklists:", checklistError);
        throw checklistError;
      }
      console.log('Checklists encontrados:', checklistData?.length || 0);
      setChecklistData(checklistData || []);

      // Buscar badges conquistadas
      try {
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select("*, badges(*)")
          .eq("user_id", user.id);
          
        if (badgesError) {
          console.warn("Erro ao buscar badges:", badgesError);
        } else {
          console.log('Badges encontrados:', badgesData?.length || 0);
        }
        
        setBadgesData(badgesData || []);
      } catch (badgesError) {
        console.warn("Tabela de badges não encontrada ou erro:", badgesError);
        setBadgesData([]);
      }
      
      // Buscar comentários feitos pelo usuário com join otimizado
      const { data: commentsData, error: commentsError } = await supabase
        .from("solution_comments")
        .select("*")
        .eq("user_id", user.id);
        
      if (commentsError) {
        console.error("Erro ao buscar comentários:", commentsError);
        throw commentsError;
      }
      console.log('Comentários encontrados:', commentsData?.length || 0);
      setComments(commentsData || []);
      
      // Buscar total de likes recebidos nos comentários
      const { data: likesData, error: likesError } = await supabase
        .from("solution_comments")
        .select("likes_count")
        .eq("user_id", user.id);
      
      if (likesError) {
        console.error("Erro ao buscar likes:", likesError);
        throw likesError;
      }
      const totalLikes = (likesData || []).reduce((acc, comment) => acc + (comment.likes_count || 0), 0);
      console.log('Total de likes:', totalLikes);
      setTotalLikes(totalLikes);

      console.log('Dados carregados com sucesso para gamificação');

    } catch (error: any) {
      console.error("Error in fetching achievements data:", error);
      setError("Ocorreu um erro ao carregar os dados de conquistas");
      toast({
        title: "Erro ao carregar dados de conquistas",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  // Inscrever-se para atualizações em tempo real
  const subscribeToUpdates = useCallback(() => {
    if (!user?.id) return;
    
    // Inscrição para mudanças na tabela progress
    const progressSubscription = supabase
      .channel('progress-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'progress',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          console.log('Atualização detectada na tabela progress - atualizando dados');
          fetchData();
        }
      )
      .subscribe();
    
    // Inscrição para mudanças na tabela user_badges
    const badgesSubscription = supabase
      .channel('badges-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          console.log('Atualização detectada na tabela user_badges - atualizando dados');
          fetchData();
        }
      )
      .subscribe();
      
    // Inscrição para mudanças na tabela user_checklists
    const checklistSubscription = supabase
      .channel('checklists-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_checklists',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          console.log('Atualização detectada na tabela user_checklists - atualizando dados');
          fetchData();
        }
      )
      .subscribe();
    
    // Inscrição para mudanças na tabela solution_comments
    const commentsSubscription = supabase
      .channel('comments-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'solution_comments',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          console.log('Atualização detectada na tabela solution_comments - atualizando dados');
          fetchData();
        }
      )
      .subscribe();
    
    setSubscriptions([
      progressSubscription, 
      badgesSubscription, 
      checklistSubscription,
      commentsSubscription
    ]);
    
    return () => {
      progressSubscription.unsubscribe();
      badgesSubscription.unsubscribe();
      checklistSubscription.unsubscribe();
      commentsSubscription.unsubscribe();
    };
  }, [user?.id, fetchData]);

  // Efeito para carregar dados iniciais e configurar inscrições
  useEffect(() => {
    console.log('useAchievementData useEffect triggered');
    fetchData();
    const unsubscribe = subscribeToUpdates();
    
    return () => {
      // Limpar todas as inscrições ao desmontar
      if (unsubscribe) unsubscribe();
      subscriptions.forEach(subscription => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      });
    };
  }, [fetchData, subscribeToUpdates]);

  return {
    loading,
    error,
    refetch: fetchData,
    progressData,
    solutions,
    checklistData,
    badgesData,
    comments,
    totalLikes
  };
};
