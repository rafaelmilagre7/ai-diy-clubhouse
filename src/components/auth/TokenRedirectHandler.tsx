import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TokenRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se há tokens de reset de senha na URL
    const checkForResetTokens = () => {
      // Verificar no hash
      const hash = location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      // Verificar nos query params
      const searchParams = new URLSearchParams(location.search);
      
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const type = hashParams.get('type') || searchParams.get('type');
      
      if (accessToken && type === 'recovery') {
        console.log('🔄 [TOKEN-REDIRECT] Tokens de reset detectados, redirecionando...');
        
        // Construir nova URL preservando os tokens
        const tokenParams = hash || location.search.substring(1);
        const redirectUrl = `/set-new-password${hash ? '#' + hash : '?' + tokenParams}`;
        
        navigate(redirectUrl, { replace: true });
      }
    };

    // Verificar tokens em qualquer rota (não apenas na raiz)
    if (location.pathname !== '/set-new-password') {
      checkForResetTokens();
    }
  }, [location, navigate]);

  return null; // Este componente não renderiza nada
};