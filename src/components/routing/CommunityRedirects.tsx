
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { checkForumRedirect } from '@/components/community/utils/routingUtils';

/**
 * Componente responsável por redirecionar URLs antigas do fórum para o sistema unificado de comunidade
 */
export const CommunityRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Verificar se é necessário fazer redirecionamento
    const redirectInfo = checkForumRedirect(currentPath);
    
    if (redirectInfo) {
      console.log(`CommunityRedirects: Redirecionando ${currentPath} para ${redirectInfo.path}`);
      navigate(redirectInfo.path, redirectInfo.options);
    }
  }, [location.pathname, navigate]);

  // Este componente não renderiza nada visualmente
  return null;
};
