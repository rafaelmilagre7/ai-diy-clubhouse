
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Settings,
  MessageSquare,
  GraduationCap,
  Calendar,
  Award,
  Route,
  Sparkles,
  Shield,
  Gift,
  MessageCircle,
  Brain
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { profile } = useAuth();

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      type: "main"
    },
    {
      title: "Trilha de IA",
      href: "/trilha-implementacao",
      icon: Route,
      type: "hero"
    },
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
      type: "regular"
    },
    {
      title: "Cursos",
      href: "/learning",
      icon: GraduationCap,
      type: "regular"
    },
    {
      title: "Certificados",
      href: "/learning/certificates",
      icon: Award,
      type: "regular"
    },
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Settings,
      type: "regular"
    },
    {
      title: "Benefícios",
      href: "/benefits",
      icon: Gift,
      type: "regular"
    },
    {
      title: "Networking AI",
      href: "/networking",
      icon: Brain,
      type: "regular"
    },
    {
      title: "Sugestões",
      href: "/suggestions",
      icon: MessageCircle,
      type: "regular"
    },
    {
      title: "Comunidade",
      href: "/comunidade",
      icon: MessageSquare,
      type: "regular"
    },
    {
      title: "Eventos",
      href: "/events",
      icon: Calendar,
      type: "regular"
    }
  ];

  if (getUserRoleName(profile) === 'admin') {
    navigationItems.push({
      title: "Painel Admin",
      href: "/admin",
      icon: Shield,
      type: "admin"
    });
  }

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    
    if (href === '/dashboard') {
      return currentPath === href;
    }
    
    if (href === '/learning/certificates') {
      return currentPath === href;
    }
    
    if (href === '/learning') {
      return currentPath.startsWith(href) && !currentPath.includes('/certificates');
    }
    
    return currentPath.startsWith(href);
  };

  const renderNavButton = (item: any) => {
    const active = isActive(item.href);
    
    // Design especial para Dashboard
    if (item.type === "main") {
      return (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 h-12 px-4 text-base font-semibold transition-all duration-300 rounded-xl group",
            !sidebarOpen && "justify-center px-3",
            active 
              ? "bg-white/15 text-white shadow-lg border border-white/30" 
              : "text-neutral-200 hover:text-white hover:bg-white/10 hover:shadow-md"
          )}
          asChild
        >
          <Link to={item.href}>
            <item.icon className="h-6 w-6 flex-shrink-0" />
            {sidebarOpen && (
              <span className="truncate">{item.title}</span>
            )}
          </Link>
        </Button>
      );
    }

    // Design especial para Trilha de IA (hero)
    if (item.type === "hero") {
      return (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 h-14 px-4 text-base font-bold transition-all duration-300 rounded-2xl group relative overflow-hidden",
            !sidebarOpen && "justify-center px-3",
            active 
              ? "bg-gradient-to-r from-viverblue to-purple-600 text-white shadow-2xl shadow-viverblue/50 transform scale-105" 
              : "bg-gradient-to-r from-viverblue/20 to-purple-600/20 text-viverblue border-2 border-viverblue/30 hover:border-viverblue/60 hover:shadow-xl hover:shadow-viverblue/30 hover:scale-102"
          )}
          asChild
        >
          <Link to={item.href}>
            <div className="relative z-10 flex items-center gap-4 min-w-0">
              <div className="relative">
                <item.icon className="h-7 w-7 flex-shrink-0" />
                {!active && <Sparkles className="h-4 w-4 text-viverblue absolute -top-1 -right-1 animate-pulse" />}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="truncate text-lg">{item.title}</span>
                  <span className={cn(
                    "text-xs font-normal",
                    active ? "text-white/90" : "text-viverblue/80"
                  )}>
                    ✨ Guia personalizado
                  </span>
                </div>
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-viverblue/10 via-purple-600/10 to-viverblue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          </Link>
        </Button>
      );
    }

    // Design para Admin
    if (item.type === "admin") {
      return (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 h-10 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
            !sidebarOpen && "justify-center px-3",
            active 
              ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-lg" 
              : "text-red-400/70 hover:text-red-300 hover:bg-red-500/10 hover:border hover:border-red-500/30"
          )}
          asChild
        >
          <Link to={item.href}>
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <span className="truncate">{item.title}</span>
            )}
          </Link>
        </Button>
      );
    }

    // Design limpo e moderno para itens regulares
    return (
      <Button
        key={item.href}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-4 h-10 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
          !sidebarOpen && "justify-center px-3",
          active 
            ? "bg-white/12 text-white shadow-md border border-white/20" 
            : "text-neutral-300 hover:text-white hover:bg-white/8 hover:shadow-sm"
        )}
        asChild
      >
        <Link to={item.href}>
          <item.icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-all duration-200",
            active ? "scale-110 text-white" : "group-hover:scale-105"
          )} />
          {sidebarOpen && (
            <span className="truncate">{item.title}</span>
          )}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col h-full px-3 py-2">
      <div className="flex flex-col space-y-1">
        {/* Dashboard - Principal */}
        {renderNavButton(navigationItems[0])}
        
        {/* Espaço visual reduzido */}
        <div className="h-2"></div>
        
        {/* Trilha de IA - Hero */}
        {renderNavButton(navigationItems[1])}
        
        {/* Espaço visual reduzido */}
        <div className="h-3"></div>
        
        {/* Grupo de Aprendizado */}
        <div className="space-y-1">
          {navigationItems.slice(2, 5).map(item => renderNavButton(item))}
        </div>
        
        {/* Espaço visual reduzido */}
        <div className="h-2"></div>
        
        {/* Grupo de Recursos */}
        <div className="space-y-1">
          {navigationItems.slice(5, 11).map(item => renderNavButton(item))}
        </div>
      </div>
      
      {/* Admin no final se existir */}
      {getUserRoleName(profile) === 'admin' && (
        <div className="mt-auto pt-3 border-t border-white/10">
          {renderNavButton(navigationItems[navigationItems.length - 1])}
        </div>
      )}
    </div>
  );
};
