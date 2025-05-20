
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkForumRedirect } from '@/components/community/utils/routingUtils';

/**
 * Componente para redirecionar automaticamente as rotas antigas do fórum para as novas da comunidade
 */
export const CommunityRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Não aplicar redirecionamentos nas rotas já da comunidade
    if (location.pathname.startsWith('/comunidade')) {
      return;
    }
    
    console.log("CommunityRedirects verificando:", location.pathname);
    
    const redirect = checkForumRedirect(location.pathname);
    
    if (redirect) {
      console.log(`CommunityRedirects: Redirecionando de ${location.pathname} para ${redirect.path}`);
      // Redireciona preservando query params
      navigate(
        `${redirect.path}${location.search}`, 
        { 
          ...redirect.options,
          state: location.state // Preserva o estado
        }
      );
    }
  }, [location, navigate]);
  
  return null; // Componente não renderiza nada
};
