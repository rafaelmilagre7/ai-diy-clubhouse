
import { QueryClient } from "@tanstack/react-query";

/**
 * Utility para centralizar invalidações de cache da comunidade
 * Evita duplicação e inconsistências nas invalidações
 */
export const createCommunityCacheUtils = (queryClient: QueryClient) => {
  return {
    /**
     * Invalida todas as queries relacionadas à comunidade
     */
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
    },

    /**
     * Invalida queries específicas de categorias
     */
    invalidateCategories: () => {
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
    },

    /**
     * Invalida queries específicas de tópicos
     */
    invalidateTopics: () => {
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
      queryClient.invalidateQueries({ queryKey: ['community-categories'] });
    },

    /**
     * Invalida queries específicas de posts
     */
    invalidatePosts: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      queryClient.invalidateQueries({ queryKey: ['community-topics'] });
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
    },

    /**
     * Invalida apenas estatísticas
     */
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: ['community-stats'] });
    },

    /**
     * Invalida queries relacionadas a relatórios/moderação
     */
    invalidateReports: () => {
      queryClient.invalidateQueries({ queryKey: ['community-reports'] });
    }
  };
};

/**
 * Hook para usar as utilidades de cache da comunidade
 */
export const useCommunityCacheUtils = () => {
  const queryClient = new QueryClient();
  return createCommunityCacheUtils(queryClient);
};
