
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkForumRedirect } from '@/components/community/utils/routingUtils';

/**
 * Componente para redirecionar automaticamente as rotas antigas do fórum para as novas da comunidade
 */
export const CommunityRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectAttemptCountRef = useRef<Record<string, number>>({});
  const lastRedirectTimeRef = useRef<number>(0);
  
  useEffect(() => {
    // Log para diagnóstico
    console.log("CommunityRedirects avaliando:", location.pathname, {
      state: location.state,
      search: location.search
    });
    
    // Anti-loop: Verificar se já redirecionamos recentemente (mecanismo de cooldown)
    const now = Date.now();
    const timeSinceLastRedirect = now - lastRedirectTimeRef.current;
    if (timeSinceLastRedirect < 1000) { // 1 segundo de cooldown
      console.warn("CommunityRedirects: Cooldown ativado, ignorando redirecionamento");
      return;
    }
    
    // Não processar redirecionamentos nas rotas já da comunidade
    if (location.pathname.startsWith('/comunidade')) {
      console.log("CommunityRedirects: Ignorando rota de comunidade:", location.pathname);
      return;
    }
    
    // Não processar redirecionamentos para rotas não relacionadas ao fórum
    if (!location.pathname.startsWith('/forum')) {
      return;
    }
    
    // Anti-loop: Verificar contagem de tentativas para este caminho específico
    redirectAttemptCountRef.current[location.pathname] = 
      (redirectAttemptCountRef.current[location.pathname] || 0) + 1;
    
    if (redirectAttemptCountRef.current[location.pathname] > 3) {
      console.error("CommunityRedirects: Muitas tentativas para redirecionar o mesmo caminho, abortando:", location.pathname);
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
      
      // Atualizar timestamp do último redirecionamento
      lastRedirectTimeRef.current = now;
      
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
