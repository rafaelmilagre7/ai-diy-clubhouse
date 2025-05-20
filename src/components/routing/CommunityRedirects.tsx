
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
    // Não processar redirecionamentos nas rotas já da comunidade
    if (location.pathname.startsWith('/comunidade')) {
      console.log("CommunityRedirects: Ignorando rota de comunidade:", location.pathname);
      return;
    }
    
    // Não processar redirecionamentos para rotas não relacionadas ao fórum
    if (!location.pathname.startsWith('/forum')) {
      return;
    }
    
    console.log("CommunityRedirects verificando:", location.pathname);
    
    const redirect = checkForumRedirect(location.pathname);
    
    if (redirect) {
      console.log(`CommunityRedirects: Redirecionando de ${location.pathname} para ${redirect.path}`);
      
      // Prevenção contra loops de redirecionamento
      if (redirect.path === location.pathname) {
        console.error("CommunityRedirects: Loop de redirecionamento detectado, abortando");
        return;
      }
      
      // Redireciona preservando query params
      navigate(
        `${redirect.path}${location.search}`, 
        { 
          ...redirect.options,
          state: { 
            ...location.state,
            redirectedFrom: location.pathname // Marcar origem do redirecionamento
          }
        }
      );
    }
  }, [location, navigate]);
  
  return null; // Componente não renderiza nada
};
