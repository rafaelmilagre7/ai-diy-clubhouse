
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MessageSquare, Users, Calendar, Bookmark, Award } from 'lucide-react';

export const CommunityNavigation = () => {
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
      name: 'Eventos', 
      path: '/comunidade/eventos', 
      icon: Calendar,
      disabled: true
    },
    { 
      name: 'Recursos', 
      path: '/comunidade/recursos', 
      icon: Bookmark,
      disabled: true
    },
    { 
      name: 'Conquistas', 
      path: '/comunidade/conquistas', 
      icon: Award,
      disabled: true,
      beta: true
    },
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
            {item.beta && (
              <span className="bg-amber-400 text-amber-900 text-xs rounded-full px-1.5 py-0.5 font-medium">
                Em breve
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
};
