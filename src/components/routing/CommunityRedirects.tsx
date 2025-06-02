
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
  const processingRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Evitar processamento duplicado
    if (processingRef.current) {
      return;
    }
    
    // Anti-loop: Verificar se já redirecionamos recentemente (mecanismo de cooldown)
    const now = Date.now();
    const timeSinceLastRedirect = now - lastRedirectTimeRef.current;
    if (timeSinceLastRedirect < 1500) { // 1.5 segundos de cooldown
      if (process.env.NODE_ENV === 'development') {
        console.warn(`CommunityRedirects: Cooldown ativado (${timeSinceLastRedirect}ms), ignorando redirecionamento`);
      }
      return;
    }
    
    // Não processar redirecionamentos nas rotas já da comunidade
    if (location.pathname.startsWith('/comunidade')) {
      return;
    }
    
    // Não processar redirecionamentos para rotas não relacionadas ao fórum
    if (!location.pathname.startsWith('/forum')) {
      return;
    }
    
    // Marcar início do processamento
    processingRef.current = true;
    
    // Anti-loop: Verificar contagem de tentativas para este caminho específico
    redirectAttemptCountRef.current[location.pathname] = 
      (redirectAttemptCountRef.current[location.pathname] || 0) + 1;
    
    if (redirectAttemptCountRef.current[location.pathname] > 3) {
      console.error("CommunityRedirects: Muitas tentativas para redirecionar o mesmo caminho, abortando:", location.pathname);
      processingRef.current = false;
      return;
    }
    
    const redirect = checkForumRedirect(location.pathname);
    
    if (redirect) {
      // Prevenção contra loops de redirecionamento
      if (redirect.path === location.pathname) {
        console.error("CommunityRedirects: Loop de redirecionamento detectado, abortando");
        processingRef.current = false;
        return;
      }
      
      // Atualizar timestamp do último redirecionamento
      lastRedirectTimeRef.current = now;
      
      // Redirecionar com um pequeno atraso para garantir que o estado da aplicação esteja estabilizado
      setTimeout(() => {
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
        
        // Resetar flag de processamento após um curto intervalo
        setTimeout(() => {
          processingRef.current = false;
        }, 100);
      }, 50);
    } else {
      processingRef.current = false;
    }
  }, [location, navigate]);
  
  return null; // Componente não renderiza nada
};
