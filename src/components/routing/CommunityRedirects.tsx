
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente para redirecionar automaticamente as rotas antigas do fórum para as novas da comunidade
 */
export const CommunityRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Não fazer redirecionamento se já estivermos em uma rota da comunidade
    if (location.pathname.startsWith('/comunidade')) {
      return;
    }
    
    // Mapeia as rotas antigas para as novas
    const pathMappings: Record<string, string> = {
      '/forum': '/comunidade',
      '/forum/category': '/comunidade/categoria',
      '/forum/topic': '/comunidade/topico',
      '/forum/new-topic': '/comunidade/novo-topico',
    };
    
    // Verifica se o caminho atual começa com algum dos prefixos antigos
    for (const [oldPath, newPath] of Object.entries(pathMappings)) {
      if (location.pathname.startsWith(oldPath)) {
        // Substitui apenas o prefixo, mantendo o resto da URL
        const newLocation = location.pathname.replace(oldPath, newPath);
        
        // Só redireciona se não estiver já no novo caminho (evita loops)
        if (newLocation !== location.pathname) {
          console.log(`CommunityRedirects: Redirecionando de ${location.pathname} para ${newLocation}`);
          // Redireciona preservando query params
          navigate(`${newLocation}${location.search}`, { 
            replace: true, // Substitui a entrada no histórico para não criar redirecionamentos desnecessários
            state: location.state // Preserva o estado
          });
          break;
        }
      }
    }
  }, [location, navigate]);
  
  return null; // Componente não renderiza nada
};
