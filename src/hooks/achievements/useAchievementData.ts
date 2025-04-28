
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ProgressData, ChecklistData, BadgeData } from "@/types/achievementTypes";
import { Solution } from "@/types/solutionTypes";

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

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('Iniciando busca de dados de conquistas');
      setLoading(true);
      setError(null);

      // Buscar soluções publicadas
      const { data: solutionsData, error: solutionsError } = await supabase
        .from("solutions")
        .select("*")
        .eq("published", true);

      if (solutionsError) throw solutionsError;
      setSolutions(solutionsData || []);

      // Buscar progresso do usuário
      const { data: progressData, error: progressError } = await supabase
        .from("progress")
        .select("*, solutions!inner(id, category)")
        .eq("user_id", user.id);

      if (progressError) throw progressError;
      setProgressData(progressData || []);

      // Buscar checklists completados
      const { data: checklistData, error: checklistError } = await supabase
        .from("user_checklists")
        .select("*")
        .eq("user_id", user.id);

      if (checklistError) throw checklistError;
      setChecklistData(checklistData || []);

      // Buscar badges conquistadas
      try {
        const { data: badgesData } = await supabase
          .from("user_badges")
          .select("*, badges(*)")
          .eq("user_id", user.id);
          
        setBadgesData(badgesData || []);
      } catch (badgesError) {
        console.warn("Tabela de badges não encontrada ou erro:", badgesError);
        setBadgesData([]);
      }
      
      // Buscar comentários feitos pelo usuário
      const { data: commentsData, error: commentsError } = await supabase
        .from("solution_comments")
        .select("*")
        .eq("user_id", user.id);
        
      if (commentsError) throw commentsError;
      setComments(commentsData || []);
      
      // Buscar total de likes recebidos nos comentários
      const { data: likesData, error: likesError } = await supabase
        .from("solution_comments")
        .select("likes_count")
        .eq("user_id", user.id);
      
      if (likesError) throw likesError;
      const totalLikes = (likesData || []).reduce((acc, comment) => acc + (comment.likes_count || 0), 0);
      setTotalLikes(totalLikes);

      // Adicionando logs para debug
      console.log('Progresso carregado:', progressData?.length || 0, 'registros');
      console.log('Badges carregados:', badgesData?.length || 0, 'registros');
      console.log('Comentários carregados:', commentsData?.length || 0, 'registros');
      console.log('Total de likes:', totalLikes);

    } catch (error: any) {
      console.error("Error in fetching achievements data:", error);
      setError("Ocorreu um erro ao carregar os dados de conquistas");
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    console.log('useAchievementData useEffect triggered');
    fetchData();
  }, [fetchData]);

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
