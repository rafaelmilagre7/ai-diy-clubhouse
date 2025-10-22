import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const TokenRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkForResetTokens = () => {
      // Verificar no hash
      const hash = location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      
      // Verificar nos query params
      const searchParams = new URLSearchParams(location.search);
      
      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const type = hashParams.get('type') || searchParams.get('type');
      
      if (accessToken && type === 'recovery') {
        const targetDomain = 'app.viverdeia.ai';
        const currentDomain = window.location.hostname;
        
        // Se não estamos no domínio correto, redirecionar
        if (currentDomain !== targetDomain) {
          setIsRedirecting(true);
          
          // Construir URL completa com tokens para o domínio correto
          const tokenParams = hash || location.search.substring(1);
          const fullRedirectUrl = `https://${targetDomain}/set-new-password${hash ? '#' + hash : '?' + tokenParams}`;
          
          // Pequeno delay para mostrar mensagem de carregamento
          setTimeout(() => {
            window.location.href = fullRedirectUrl;
          }, 1000);
          
          return;
        }
        
        // Se já estamos no domínio correto, apenas navegar localmente
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

  // Mostrar loading durante redirecionamento cross-domain
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-6 rounded-lg shadow-lg text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Redirecionando para reset de senha
          </h3>
          <p className="text-sm text-muted-foreground">
            Você será redirecionado para completar o reset da sua senha...
          </p>
        </div>
      </div>
    );
  }

  return null;
};