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
      // Redirect old miracleai URLs to new builder URLs (must come before /ferramentas rule)
      {
        from: /^\/ferramentas\/miracleai(.*)$/,
        to: (match) => {
          const rest = match.split('/miracleai')[1] || '';
          return `/ferramentas/builder${rest}`;
        },
        permanent: true
      },
      
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
      
      // Old tools URLs (not including builder/miracleai which are handled above)
      {
        from: /^\/ferramentas\/(?!builder|miracleai)(.+)$/,
        to: (match) => {
          const toolPath = match.split('/ferramentas/')[1];
          return `/tools/${toolPath}`;
        },
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
