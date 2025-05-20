
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
      const { data: pinnedTopics, error: pinnedError } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*),
          category:category_id(id, name, slug)
        `)
        .eq('category_id', categoryId)
        .eq('is_pinned', true)
        .order('last_activity_at', { ascending: false });
      
      if (pinnedError) {
        console.error("Erro ao buscar tópicos fixados:", pinnedError);
        throw pinnedError;
      }
      
      // Depois buscar os tópicos normais, paginados
      const { data: regularTopics, error: regularError, count } = await supabase
        .from('forum_topics')
        .select(`
          *,
          profiles:user_id(*),
          category:category_id(id, name, slug)
        `, { count: 'exact' })
        .eq('category_id', categoryId)
        .eq('is_pinned', false)
        .order('last_activity_at', { ascending: false })
        .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
      
      if (regularError) {
        console.error("Erro ao buscar tópicos regulares:", regularError);
        throw regularError;
      }
      
      console.log("Tópicos carregados com sucesso:", {
        fixados: pinnedTopics?.length || 0,
        regulares: regularTopics?.length || 0,
        total: count || 0
      });
      
      return { 
        pinnedTopics: pinnedTopics as Topic[] || [],
        regularTopics: regularTopics as Topic[] || [],
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
