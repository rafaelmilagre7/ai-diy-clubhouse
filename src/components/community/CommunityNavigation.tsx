
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Bookmark, UserPlus } from 'lucide-react';

interface CommunityNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  categories?: any[];
}

export const CommunityNavigation = ({ 
  activeTab, 
  onTabChange, 
  categories 
}: CommunityNavigationProps = {}) => {
  const { pathname } = useLocation();
  
  const navItems = [
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
    },
    { 
      name: 'Recursos', 
      path: '/comunidade/recursos', 
      icon: Bookmark,
      disabled: true
    }
  ];
  
  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname.startsWith(path);
  };
  
  return (
    <nav className="mb-6 border-b pb-1">
      <div className="flex overflow-x-auto py-2 space-x-2 px-1">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.disabled ? '#' : item.path}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md whitespace-nowrap transition-colors",
              isActive(item.path, item.exact)
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-muted-foreground"
            )}
            onClick={(e) => item.disabled && e.preventDefault()}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};
