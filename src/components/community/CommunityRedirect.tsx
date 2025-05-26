
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const CommunityRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    console.log('CommunityRedirect: Verificando redirecionamento', { pathname: location.pathname, tab });
    
    if (location.pathname === '/comunidade' && tab) {
      let newPath = '/comunidade';
      
      switch (tab) {
        case 'members':
          newPath = '/comunidade/membros';
          break;
        case 'connections':
          newPath = '/comunidade/conexoes';
          break;
        case 'messages':
          newPath = '/comunidade/mensagens';
          break;
        case 'suggestions':
          newPath = '/comunidade/sugestoes';
          break;
        default:
          newPath = '/comunidade';
      }
      
      console.log('CommunityRedirect: Redirecionando para', newPath);
      navigate(newPath, { replace: true });
    }
  }, [location, navigate]);

  return null;
};
