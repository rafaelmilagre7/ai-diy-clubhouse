import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface RedirectRule {
  from: string | RegExp;
  to: string | ((match: string) => string);
  permanent?: boolean;
}

export const useURLRedirects = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectRules: RedirectRule[] = [
      // Old forum URLs to new community URLs
      {
        from: /^\/forum\/(.+)$/,
        to: (match) => `/comunidade/${match.split('/')[1]}`,
        permanent: true
      },
      
      // Old learning URLs
      {
        from: /^\/cursos\/(.+)$/,
        to: (match) => `/learning/course/${match.split('/')[1]}`,
        permanent: true
      },
      
      // Old tools URLs
      {
        from: /^\/ferramentas\/(.+)$/,
        to: (match) => `/tools/${match.split('/')[1]}`,
        permanent: true
      },
      
      // Old solutions URLs
      {
        from: /^\/solucoes\/(.+)$/,
        to: (match) => `/solutions/${match.split('/')[1]}`,
        permanent: true
      },
      
      // Legacy admin URLs
      {
        from: '/administracao',
        to: '/admin',
        permanent: true
      },
      
      // Legacy profile URLs
      {
        from: '/meu-perfil',
        to: '/profile',
        permanent: true
      }
    ];

    const currentPath = location.pathname;
    
    for (const rule of redirectRules) {
      let shouldRedirect = false;
      let redirectTo = '';

      if (typeof rule.from === 'string') {
        if (currentPath === rule.from) {
          shouldRedirect = true;
          redirectTo = typeof rule.to === 'string' ? rule.to : rule.to(currentPath);
        }
      } else {
        // RegExp rule
        const match = currentPath.match(rule.from);
        if (match) {
          shouldRedirect = true;
          redirectTo = typeof rule.to === 'string' ? rule.to : rule.to(currentPath);
        }
      }

      if (shouldRedirect && redirectTo !== currentPath) {
        console.log(`SEO Redirect: ${currentPath} -> ${redirectTo}`);
        
        if (rule.permanent) {
          // For permanent redirects, replace the history entry
          navigate(redirectTo, { replace: true });
        } else {
          // For temporary redirects, keep history
          navigate(redirectTo);
        }
        break; // Stop after first match
      }
    }
  }, [location.pathname, navigate]);
};
