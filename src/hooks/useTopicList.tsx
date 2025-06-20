
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Topic } from "@/types/forumTypes";
import { getUserRoleName } from "@/lib/supabase/types";

interface UseTopicListProps {
  categoryId: string;
  categorySlug?: string;
  itemsPerPage?: number;
}

interface TopicListData {
  pinnedTopics: Topic[];
  regularTopics: Topic[];
  totalCount: number;
}

export const useTopicList = ({ categoryId, categorySlug, itemsPerPage = 10 }: UseTopicListProps) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);

  // Usando useEffect para logs de diagnóstico
  useEffect(() => {
    console.log("useTopicList hook inicializado:", {
      categoryId,
      categorySlug,
      currentPage,
      itemsPerPage
    });
    
    return () => {
      console.log("useTopicList hook desmontado");
    };
  }, [categoryId, categorySlug, currentPage, itemsPerPage]);

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
        .eq('category_id', categoryId as any)
        .eq('is_pinned', true as any)
        .order('last_activity_at', { ascending: false });
      
      if (pinnedError) {
        console.error("Erro ao buscar tópicos fixados:", pinnedError);
        throw pinnedError;
      }
      
      // Depois buscar os tópicos normais, paginados
      const { data: regularTopicsData, error: regularError, count } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact' })
        .eq('category_id', categoryId as any)
        .eq('is_pinned', false as any)
        .order('last_activity_at', { ascending: false })
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
      
      if (regularError) {
        console.error("Erro ao buscar tópicos regulares:", regularError);
        throw regularError;
      }
      
      // Processar os dados para garantir que são do tipo Topic
      const processTopics = (topicsData: any[]) => {
        return topicsData.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          user_id: (topic as any).user_id,
          category_id: topic.category_id,
          is_pinned: topic.is_pinned,
          is_locked: topic.is_locked,
          is_solved: topic.is_solved,
          view_count: topic.view_count,
          reply_count: topic.reply_count,
          last_activity_at: topic.last_activity_at,
          created_at: topic.created_at,
          updated_at: topic.updated_at
        }));
      };
      
      const processedPinnedTopics = processTopics((pinnedTopicsData as any) || []);
      const processedRegularTopics = processTopics((regularTopicsData as any) || []);
      
      console.log("Tópicos carregados com sucesso:", {
        pinnedCount: processedPinnedTopics.length,
        regularCount: processedRegularTopics.length,
        totalCount: count
      });
      
      // Buscar informações do usuário para cada tópico
      const topicsWithUserInfo = await Promise.all([
        ...processedPinnedTopics.map(async (topic: any) => {
          try {
            const { data: userInfo } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', (topic as any).user_id as any)
              .single();
            
            return {
              ...topic,
              user: userInfo || { name: 'Usuário não encontrado', avatar_url: null }
            };
          } catch (error) {
            console.error("Erro ao buscar informações do usuário:", error);
            return {
              ...topic,
              user: { name: 'Usuário não encontrado', avatar_url: null }
            };
          }
        }),
        ...processedRegularTopics.map(async (topic: any) => {
          try {
            const { data: userInfo } = await supabase
              .from('profiles')
              .select('name, avatar_url')
              .eq('id', (topic as any).user_id as any)
              .single();
            
            return {
              ...topic,
              user: userInfo || { name: 'Usuário não encontrado', avatar_url: null }
            };
          } catch (error) {
            console.error("Erro ao buscar informações do usuário:", error);
            return {
              ...topic,
              user: { name: 'Usuário não encontrado', avatar_url: null }
            };
          }
        })
      ]);
      
      const finalPinnedTopics = topicsWithUserInfo.slice(0, processedPinnedTopics.length);
      const finalRegularTopics = topicsWithUserInfo.slice(processedPinnedTopics.length);
      
      return {
        pinnedTopics: finalPinnedTopics,
        regularTopics: finalRegularTopics,
        totalCount: count || 0
      };
      
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      setErrorCount(prev => prev + 1);
      
      // Se houver muitos erros consecutivos, mostrar toast
      if (errorCount >= 2) {
        toast.error("Erro ao carregar tópicos. Tente recarregar a página.");
      }
      
      throw error;
    }
  };

  const query = useQuery({
    queryKey: ['communityTopics', categoryId, currentPage, itemsPerPage],
    queryFn: fetchTopics,
    staleTime: 30 * 1000, // 30 segundos
    retry: 2,
    enabled: !!categoryId
  });

  const nextPage = () => {
    if (query.data) {
      const maxPage = Math.ceil(query.data.totalCount / itemsPerPage) - 1;
      if (currentPage < maxPage) {
        setCurrentPage(prev => prev + 1);
      }
    }
  };

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Funções adicionais necessárias para TopicList.tsx
  const handleRetry = () => {
    query.refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const hasTopics = (query.data?.pinnedTopics.length || 0) + (query.data?.regularTopics.length || 0) > 0;

  return {
    // Dados
    pinnedTopics: query.data?.pinnedTopics || [],
    regularTopics: query.data?.regularTopics || [],
    totalCount: query.data?.totalCount || 0,
    
    // Estados
    isLoading: query.isLoading,
    error: query.error,
    
    // Paginação
    currentPage,
    itemsPerPage,
    totalPages: query.data ? Math.ceil(query.data.totalCount / itemsPerPage) : 0,
    hasNextPage: query.data ? currentPage < Math.ceil(query.data.totalCount / itemsPerPage) - 1 : false,
    hasPreviousPage: currentPage > 0,
    
    // Propriedades adicionais
    hasTopics,
    handleRetry,
    handlePageChange,
    
    // Ações
    nextPage,
    previousPage,
    goToPage,
    refetch: query.refetch
  };
};
