
import { QueryClient } from "@tanstack/react-query";

/**
 * Utility para centralizar invalidações de cache do fórum
 * Evita duplicação e inconsistências nas invalidações
 */
export const createForumCacheUtils = (queryClient: QueryClient) => {
  return {
    /**
     * Invalida todas as queries relacionadas ao fórum
     */
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
      queryClient.invalidateQueries({ queryKey: ['forum-reports'] });
    },

    /**
     * Invalida queries específicas de categorias
     */
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
    },

    /**
     * Invalida queries específicas de tópicos
     */
    invalidateTopics: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
    },

    /**
     * Invalida queries específicas de posts
     */
    invalidatePosts: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
    },

    /**
     * Invalida apenas estatísticas
     */
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
    },

    /**
     * Invalida queries relacionadas a relatórios/moderação
     */
    invalidateReports: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-reports'] });
    }
  };
};

/**
 * Hook para usar as utilidades de cache do fórum
 */
export const useForumCache = () => {
  const queryClient = new QueryClient();
  return createForumCacheUtils(queryClient);
};
