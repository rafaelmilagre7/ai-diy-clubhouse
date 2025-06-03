
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Componente para redirecionar rotas antigas para as novas rotas em português
 */
export const LegacyRouteRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Mapeamento de rotas antigas para novas
    const routeMapping: Record<string, string> = {
      '/solutions': '/solucoes',
      '/implementation-trail': '/trilha-implementacao',
      '/tools': '/ferramentas',
      '/benefits': '/beneficios',
      '/events': '/eventos',
      '/profile': '/perfil',
      '/learning': '/aprendizado',
    };

    // Verificar redirecionamentos simples
    if (routeMapping[currentPath]) {
      console.log(`Redirecionando de ${currentPath} para ${routeMapping[currentPath]}`);
      navigate(routeMapping[currentPath], { replace: true });
      return;
    }

    // Redirecionamentos com parâmetros
    if (currentPath.startsWith('/solutions/')) {
      const solutionId = currentPath.split('/solutions/')[1];
      if (solutionId && !solutionId.includes('/')) {
        // Redirecionar /solutions/:id para /solucoes/:id
        const newPath = `/solucoes/${solutionId}`;
        console.log(`Redirecionando de ${currentPath} para ${newPath}`);
        navigate(newPath, { replace: true });
        return;
      }
      if (solutionId && solutionId.includes('/implementar')) {
        // Redirecionar /solutions/:id/implementar para /solucoes/:id/implementar
        const newPath = currentPath.replace('/solutions/', '/solucoes/');
        console.log(`Redirecionando de ${currentPath} para ${newPath}`);
        navigate(newPath, { replace: true });
        return;
      }
    }

    // Redirecionamentos para sub-rotas do learning
    if (currentPath.startsWith('/learning/')) {
      const newPath = currentPath.replace('/learning/', '/aprendizado/');
      console.log(`Redirecionando de ${currentPath} para ${newPath}`);
      navigate(newPath, { replace: true });
      return;
    }
  }, [location.pathname, navigate]);

  return null;
};
