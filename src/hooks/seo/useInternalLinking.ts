
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface InternalLink {
  url: string;
  title: string;
  description?: string;
}

export const useInternalLinking = () => {
  const location = useLocation();

  useEffect(() => {
    // Add structured internal linking based on current page
    const addInternalLinks = () => {
      const currentPath = location.pathname;
      let suggestedLinks: InternalLink[] = [];

      // Define related content based on current route
      switch (true) {
        case currentPath === '/dashboard':
          suggestedLinks = [
            { url: '/tools', title: 'Ferramentas de IA', description: 'Explore ferramentas disponíveis' },
            { url: '/learning', title: 'Aprendizado', description: 'Cursos e materiais educativos' },
            { url: '/solutions', title: 'Soluções', description: 'Soluções para seu negócio' }
          ];
          break;
        
        case currentPath.startsWith('/tools'):
          suggestedLinks = [
            { url: '/learning', title: 'Cursos de IA', description: 'Aprenda a usar as ferramentas' },
            { url: '/community', title: 'Comunidade', description: 'Discuta sobre ferramentas' },
            { url: '/solutions', title: 'Soluções', description: 'Implementações práticas' }
          ];
          break;
        
        case currentPath.startsWith('/learning'):
          suggestedLinks = [
            { url: '/tools', title: 'Ferramentas', description: 'Aplique o conhecimento' },
            { url: '/community', title: 'Comunidade', description: 'Tire dúvidas e compartilhe' },
            { url: '/dashboard', title: 'Dashboard', description: 'Acompanhe seu progresso' }
          ];
          break;
        
        case currentPath.startsWith('/community'):
          suggestedLinks = [
            { url: '/learning', title: 'Aprendizado', description: 'Aprenda mais sobre IA' },
            { url: '/tools', title: 'Ferramentas', description: 'Descubra novas ferramentas' },
            { url: '/solutions', title: 'Soluções', description: 'Veja implementações práticas' }
          ];
          break;
      }

      // Add JSON-LD for internal linking (helps search engines understand relationships)
      if (suggestedLinks.length > 0) {
        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': suggestedLinks.map((link, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': link.title,
            'item': `https://app.viverdeia.ai${link.url}`
          }))
        };

        const scriptId = 'internal-linking-schema';
        const existing = document.getElementById(scriptId);
        if (existing) {
          existing.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(breadcrumbSchema);
        document.head.appendChild(script);
      }
    };

    addInternalLinks();

    return () => {
      const script = document.getElementById('internal-linking-schema');
      if (script) {
        script.remove();
      }
    };
  }, [location.pathname]);
};
