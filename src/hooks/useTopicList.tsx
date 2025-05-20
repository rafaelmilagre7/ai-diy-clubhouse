
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Topic } from "@/types/forumTypes";

interface UseTopicListProps {
  categoryId: string;
  itemsPerPage?: number;
}

interface TopicListData {
  pinnedTopics: Topic[];
  regularTopics: Topic[];
  totalCount: number;
}

export const useTopicList = ({ categoryId, itemsPerPage = 10 }: UseTopicListProps) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

  // Usando useEffect para logs de diagnóstico
  useEffect(() => {
    console.log("useTopicList hook inicializado:", {
      categoryId,
      currentPage,
      itemsPerPage
    });
    
    return () => {
      console.log("useTopicList hook desmontado");
    };
  }, [categoryId, currentPage, itemsPerPage]);

  const fetchTopics = async (): Promise<TopicListData> => {
    try {
      console.log("Buscando tópicos para categoria:", categoryId, "página:", currentPage);
      
      // Verificação de segurança para categoryId
      if (!categoryId) {
        console.error("CategoryId está vazio ou inválido");
        return { 
          pinnedTopics: [],
          regularTopics: [],
          totalCount: 0
        };
      }
      
      // Primeiro buscar todos os tópicos fixados
      const { data: pinnedTopicsData, error: pinnedError } = await supabase
        .from('forum_topics')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_pinned', true)
        .order('last_activity_at', { ascending: false });
      
      if (pinnedError) {
        console.error("Erro ao buscar tópicos fixados:", pinnedError);
        throw pinnedError;
      }
      
      // Depois buscar os tópicos normais, paginados
      const { data: regularTopicsData, error: regularError, count } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId)
        .eq('is_pinned', false)
        .order('last_activity_at', { ascending: false })
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
      
      if (regularError) {
        console.error("Erro ao buscar tópicos regulares:", regularError);
        throw regularError;
      }

      // Agora, buscar os perfis dos usuários separadamente
      const allTopics = [...(pinnedTopicsData || []), ...(regularTopicsData || [])];
      const userIds = [...new Set(allTopics.map(topic => topic.user_id))];

      let userProfiles: any[] = [];
      if (userIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role')
          .in('id', userIds);

        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
        } else {
          userProfiles = profiles || [];
        }
      }

      // Buscar categorias relacionadas
      const categoryIds = [...new Set(allTopics.map(topic => topic.category_id))];
      let categories: any[] = [];
      if (categoryIds.length > 0) {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('id, name, slug')
          .in('id', categoryIds);

        if (categoriesError) {
          console.error("Erro ao buscar categorias:", categoriesError);
        } else {
          categories = categoriesData || [];
        }
      }

      // Mapear manualmente os dados de perfil e categoria para cada tópico
      const mapTopicWithRelations = (topic: any): Topic => {
        const userProfile = userProfiles.find(profile => profile.id === topic.user_id);
        const category = categories.find(cat => cat.id === topic.category_id);

        return {
          ...topic,
          profiles: userProfile ? {
            id: userProfile.id,
            name: userProfile.name || 'Usuário',
            avatar_url: userProfile.avatar_url,
            role: userProfile.role || ''
          } : null,
          category: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug
          } : null
        };
      };
      
      const pinnedTopics = (pinnedTopicsData || []).map(mapTopicWithRelations);
      const regularTopics = (regularTopicsData || []).map(mapTopicWithRelations);
      
      console.log("Tópicos carregados com sucesso:", {
        fixados: pinnedTopics.length,
        regulares: regularTopics.length,
        total: count || 0
      });
      
      return { 
        pinnedTopics,
        regularTopics,
        totalCount: count || 0
      };
    } catch (error: any) {
      console.error("Erro ao buscar tópicos:", error.message);
      setErrorCount(prev => prev + 1);
      throw error;
    }
  };

  const { data, isLoading, error, refetch } = useQuery<TopicListData, Error>({
    queryKey: ['forumTopics', categoryId, currentPage],
    queryFn: fetchTopics,
    refetchOnWindowFocus: false,
    retry: 3,
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    meta: {
      onError: (err) => {
        console.error("Erro na query de tópicos:", err);
      }
    }
  });

  // Monitorar erros para exibir feedback ao usuário
  useEffect(() => {
    if (errorCount > 2) {
      toast.error("Problemas ao carregar os tópicos. Tentando novamente...", {
        id: "topic-list-error",
        duration: 3000
      });
    }
  }, [errorCount]);

  const handleRetry = () => {
    toast.info("Atualizando lista de tópicos...");
    setErrorCount(0);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const pinnedTopics = data?.pinnedTopics || [];
  const regularTopics = data?.regularTopics || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasTopics = pinnedTopics.length > 0 || regularTopics.length > 0;

  return {
    pinnedTopics,
    regularTopics,
    totalCount,
    totalPages,
    currentPage,
    hasTopics,
    isLoading,
    error,
    handleRetry,
    handlePageChange
  };
};
