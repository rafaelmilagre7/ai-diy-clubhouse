
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
  // Tratamento especial para rota raiz
  if (routeToCheck === "/") {
    return currentPath === "/";
  }
  
  // Tratamento especial para comunidade
  if (routeToCheck === "/comunidade") {
    const isCommunityRoute = currentPath === "/comunidade" || 
                             currentPath.startsWith("/comunidade/");
    console.log(`isActiveRoute: Verificando '${currentPath}' para comunidade, resultado: ${isCommunityRoute}`);
    return isCommunityRoute;
  }
  
  // Verificação para evitar correspondências parciais (ex: /com não deve corresponder a /comunidade)
  if (currentPath === routeToCheck) {
    return true;
  }
  
  if (currentPath.startsWith(routeToCheck + '/')) {
    return true;
  }
  
  return false;
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
  // Verificar se o caminho atual começa com algum dos prefixos antigos
  for (const [oldPath, newPath] of Object.entries(forumRouteMapping)) {
    if (currentPath === oldPath || currentPath.startsWith(oldPath + '/')) {
      // Substitui apenas o prefixo, mantendo o resto da URL
      const redirectPath = currentPath.replace(oldPath, newPath);
      console.log(`checkForumRedirect: Convertendo ${oldPath} para ${newPath} -> ${redirectPath}`);
      
      return {
        path: redirectPath,
        options: { 
          replace: true // Substitui a entrada no histórico
        }
      };
    }
  }
  
  console.log(`checkForumRedirect: Nenhum redirecionamento necessário para ${currentPath}`);
  return null;
};
