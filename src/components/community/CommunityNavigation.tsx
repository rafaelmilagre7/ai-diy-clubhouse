
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Bookmark, UserPlus, Home } from 'lucide-react';

interface CommunityNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  categories?: any[];
  activeCategory?: string;
}

export const CommunityNavigation = ({ 
  activeTab, 
  onTabChange, 
  categories = [],
  activeCategory
}: CommunityNavigationProps = {}) => {
  const { pathname } = useLocation();
  
  const navItems = [
    { 
      name: 'Início', 
      path: '/comunidade', 
      icon: Home,
      exact: true
    },
    { 
      name: 'Fórum', 
      path: '/comunidade', 
      icon: MessageSquare,
      exact: true
    },
    { 
      name: 'Membros', 
      path: '/comunidade/membros', 
      icon: Users 
    },
    { 
      name: 'Conexões',
      path: '/comunidade/conexoes',
      icon: UserPlus
    }
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };
  
  return (
    <nav className="mb-6 border-b">
      <div className="flex overflow-x-auto py-2 space-x-1 px-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.disabled ? '#' : item.path}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors text-sm font-medium",
              isActive(item.path, item.exact)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
            )}
            onClick={(e) => {
              if (item.disabled) e.preventDefault();
              if (onTabChange && item.name === 'Fórum') onTabChange('todos');
            }}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
      
      {/* Categorias do fórum */}
      {pathname === '/comunidade' && categories.length > 0 && (
        <div className="flex overflow-x-auto py-2 space-x-1 px-1 border-t bg-muted/20">
          <button
            onClick={() => onTabChange?.('todos')}
            className={cn(
              "px-3 py-1 rounded-md whitespace-nowrap transition-colors text-xs",
              activeTab === 'todos'
                ? "bg-background text-foreground font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todas as categorias
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onTabChange?.(category.slug)}
              className={cn(
                "px-3 py-1 rounded-md whitespace-nowrap transition-colors text-xs",
                activeTab === category.slug
                  ? "bg-background text-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
