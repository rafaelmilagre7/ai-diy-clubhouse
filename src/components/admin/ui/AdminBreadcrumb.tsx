import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb padrão do admin com navegação automática
 * Gera breadcrumbs baseado na rota atual ou aceita items customizados
 */
export const AdminBreadcrumb = ({ items, className }: AdminBreadcrumbProps) => {
  const location = useLocation();
  
  // Geração automática de breadcrumbs baseada na rota
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/admin' }
    ];

    if (pathSegments.length > 1) {
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const href = '/' + pathSegments.slice(0, i + 1).join('/');
        const isLast = i === pathSegments.length - 1;
        
        // Mapping de segmentos para labels
        const labelMap: Record<string, string> = {
          'users': 'Usuários',
          'tools': 'Ferramentas',
          'benefits': 'Benefícios',
          'solutions': 'Soluções',
          'analytics': 'Analytics',
          'suggestions': 'Sugestões',
          'events': 'Eventos',
          'roles': 'Roles',
          'invites': 'Convites',
          'communications': 'Comunicações',
          'security': 'Segurança',
          'diagnostics': 'Diagnósticos',
          'nps': 'NPS Analytics',
          'new': 'Novo',
          'edit': 'Editar'
        };

        breadcrumbs.push({
          label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : href,
          current: isLast
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav className={cn('flex items-center space-x-1 text-sm', className)}>
      <Link
        to="/admin"
        className="flex items-center gap-1 text-text-muted hover:text-aurora transition-colors"
      >
        <Home className="h-4 w-4" />
        <span>Admin</span>
      </Link>
      
      {breadcrumbItems.length > 1 && (
        <>
          <ChevronRight className="h-4 w-4 text-text-muted" />
          
          {breadcrumbItems.slice(1).map((item, index) => (
            <React.Fragment key={index}>
              {item.current || !item.href ? (
                <span className="text-text-primary font-medium">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="text-text-muted hover:text-aurora transition-colors"
                >
                  {item.label}
                </Link>
              )}
              
              {index < breadcrumbItems.length - 2 && (
                <ChevronRight className="h-4 w-4 text-text-muted" />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </nav>
  );
};