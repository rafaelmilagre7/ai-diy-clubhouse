
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useForumDiagnostics = () => {
  return useQuery({
    queryKey: ['forum-diagnostics'],
    queryFn: async () => {
      const diagnostics = {
        connectionOk: false,
        tablesExist: {
          forum_topics: false,
          forum_categories: false,
          profiles: false
        },
        counts: {
          topics: 0,
          categories: 0,
          profiles: 0
        },
        sampleData: {
          topics: [],
          categories: [],
          profiles: []
        },
        errors: [] as string[]
      };

      try {
        // Teste de conectividade básica
        const { data: connectionTest } = await supabase.from('forum_topics').select('count', { count: 'exact', head: true });
        diagnostics.connectionOk = true;
        diagnostics.tablesExist.forum_topics = true;
        diagnostics.counts.topics = connectionTest?.length || 0;
      } catch (error: any) {
        diagnostics.errors.push(`Erro forum_topics: ${error.message}`);
      }

      try {
        const { data: categoriesData } = await supabase.from('forum_categories').select('*').limit(5);
        diagnostics.tablesExist.forum_categories = true;
        diagnostics.counts.categories = categoriesData?.length || 0;
        diagnostics.sampleData.categories = categoriesData || [];
      } catch (error: any) {
        diagnostics.errors.push(`Erro forum_categories: ${error.message}`);
      }

      try {
        const { data: profilesData } = await supabase.from('profiles').select('*').limit(5);
        diagnostics.tablesExist.profiles = true;
        diagnostics.counts.profiles = profilesData?.length || 0;
        diagnostics.sampleData.profiles = profilesData || [];
      } catch (error: any) {
        diagnostics.errors.push(`Erro profiles: ${error.message}`);
      }

      try {
        const { data: topicsData } = await supabase.from('forum_topics').select('*').limit(5);
        diagnostics.sampleData.topics = topicsData || [];
      } catch (error: any) {
        diagnostics.errors.push(`Erro ao buscar tópicos de amostra: ${error.message}`);
      }

      console.log("🔍 Diagnósticos do fórum:", diagnostics);
      return diagnostics;
    },
    retry: 1,
    refetchOnWindowFocus: false
  });
};
