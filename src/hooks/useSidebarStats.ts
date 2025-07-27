
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SidebarStats {
  solutions: number;
  courses: number;
  tools: number;
  communityTopics: number;
  monthlyEvents: number;
  benefits: number;
  networkingActive: boolean;
}

export const useSidebarStats = () => {
  return useQuery({
    queryKey: ['sidebar-stats'],
    queryFn: async (): Promise<SidebarStats> => {
      try {
        // Buscar soluções disponíveis
        const { count: solutionsCount } = await supabase
          .from('solutions')
          .select('*', { count: 'exact', head: true });

        // Buscar cursos de formação disponíveis
        const { count: coursesCount } = await supabase
          .from('learning_courses')
          .select('*', { count: 'exact', head: true });

        // Buscar ferramentas disponíveis
        const { count: toolsCount } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true });

        // Buscar tópicos da comunidade (todos)
        const { count: communityTopicsCount } = await supabase
          .from('community_topics')
          .select('*', { count: 'exact', head: true });

        // Buscar eventos do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        
        console.log('🔍 [SIDEBAR-STATS] Período de busca:', {
          startOfMonth: startOfMonth.toISOString(),
          endOfMonth: endOfMonth.toISOString(),
          currentMonth: now.getMonth() + 1,
          currentYear: now.getFullYear()
        });
        
        const { count: eventsCount, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', startOfMonth.toISOString())
          .lte('start_time', endOfMonth.toISOString());

        console.log('📊 [SIDEBAR-STATS] Resultado eventos:', { eventsCount, eventsError });

        // Buscar ferramentas que têm benefícios cadastrados
        const { count: benefitsCount } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('has_member_benefit', true);

        return {
          solutions: solutionsCount || 0,
          courses: coursesCount || 0,
          tools: toolsCount || 0,
          communityTopics: communityTopicsCount || 0,
          monthlyEvents: eventsCount || 0,
          benefits: benefitsCount,
          networkingActive: true // Sempre ativo para membros
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas da sidebar:', error);
        // Retornar valores padrão em caso de erro
        return {
          solutions: 12,
          courses: 8,
          tools: 82,
          communityTopics: 3,
          monthlyEvents: 4,
          benefits: 7,
          networkingActive: true
        };
      }
    },
    staleTime: 0, // Sem cache para garantir dados atualizados  
    refetchInterval: false, // Desabilitar refetch automático
    refetchOnMount: true, // Sempre buscar ao montar
    refetchOnWindowFocus: true // Buscar quando a janela ganhar foco
  });
};
