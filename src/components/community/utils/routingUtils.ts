
import { NavigateOptions } from "react-router-dom";

/**
 * Mapeia rotas antigas do fórum para novas rotas da comunidade
 */
export const forumRouteMapping: Record<string, string> = {
  '/forum': '/comunidade',
  '/forum/category': '/comunidade/categoria',
  '/forum/topic': '/comunidade/topico',
  '/forum/new-topic': '/comunidade/novo-topico',
};

/**
 * Verifica se uma rota atual corresponde a uma rota específica ou suas sub-rotas
 * @param currentPath Caminho atual da aplicação
 * @param routeToCheck Rota para verificar
 * @returns true se a rota atual corresponde à rota verificada ou suas sub-rotas
 */
export const isActiveRoute = (currentPath: string, routeToCheck: string): boolean => {
  // Caso especial para a comunidade
  if (routeToCheck === "/comunidade") {
    return currentPath === "/comunidade" || 
           currentPath === "/forum" || 
           currentPath.startsWith("/comunidade/") ||
           currentPath.startsWith("/forum/");
  }
  
  // Verificação padrão para outras rotas
  return currentPath === routeToCheck || 
         currentPath.startsWith(routeToCheck + '/');
};

/**
 * Verifica se uma rota antiga deve ser redirecionada e retorna a nova rota
 * @param currentPath Rota atual
 * @returns Objeto com informações de redirecionamento ou null se não precisar redirecionar
 */
export const checkForumRedirect = (currentPath: string): { 
  path: string, 
  options: NavigateOptions 
} | null => {
  // Não fazer redirecionamento se já estivermos em uma rota da comunidade
  if (currentPath.startsWith('/comunidade')) {
    return null;
  }
  
  // Verificar se o caminho atual começa com algum dos prefixos antigos
  for (const [oldPath, newPath] of Object.entries(forumRouteMapping)) {
    if (currentPath.startsWith(oldPath)) {
      // Substitui apenas o prefixo, mantendo o resto da URL
      const redirectPath = currentPath.replace(oldPath, newPath);
      return {
        path: redirectPath,
        options: { 
          replace: true // Substitui a entrada no histórico
        }
      };
    }
  }
  
  return null;
};
