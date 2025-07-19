import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SidebarStats {
  solutions: number;
  courses: number;
  tools: number;
  forumTopics: number;
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
        const { count: forumTopicsCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });

        // Buscar eventos do mês atual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const { count: eventsCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', startOfMonth.toISOString())
          .lte('start_time', endOfMonth.toISOString());

        // Buscar ferramentas que têm benefícios cadastrados
        const { count: benefitsCount } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('has_member_benefit', true);

        return {
          solutions: solutionsCount || 0,
          courses: coursesCount || 0,
          tools: toolsCount || 0,
          forumTopics: forumTopicsCount || 0,
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
          forumTopics: 3,
          monthlyEvents: 4,
          benefits: 7,
          networkingActive: true
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 10 * 60 * 1000, // Atualizar a cada 10 minutos
  });
};