
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const CommunityRedirect = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário está em /comunidade exatamente, não precisa redirecionar
    if (location.pathname === '/comunidade') {
      console.log('Usuário na página principal da comunidade');
      return;
    }

    // Log para debug de rotas
    console.log('CommunityRedirect - Rota atual:', location.pathname);
  }, [location.pathname, navigate]);

  return null;
};
