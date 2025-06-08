
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
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { profile } = useAuth();

  // Todos os itens de navegação em uma estrutura simples
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
      type: "hero",
      description: "Guia personalizado"
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

  // Adicionar admin se for admin
  if (profile?.role === 'admin') {
    navigationItems.push({
      title: "Painel Admin",
      href: "/admin",
      icon: Shield,
      type: "admin"
    });
  }

  // Lógica de ativação mais específica
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
    
    // Design especial para Trilha de IA (hero)
    if (item.type === "hero") {
      return (
        <Button
          key={item.href}
          variant="ghost"
          className={cn(
            "w-full justify-start gap-4 h-14 px-4 text-base font-semibold transition-all duration-300 rounded-2xl group relative overflow-hidden",
            !sidebarOpen && "justify-center px-3",
            active 
              ? "bg-gradient-to-r from-viverblue via-viverblue to-purple-500 text-white shadow-2xl shadow-viverblue/40 scale-105" 
              : "bg-gradient-to-r from-viverblue/10 to-purple-500/10 text-viverblue border-2 border-viverblue/20 hover:border-viverblue/40 hover:shadow-xl hover:shadow-viverblue/25 hover:scale-105"
          )}
          asChild
        >
          <Link to={item.href}>
            <div className="relative z-10 flex items-center gap-4 min-w-0">
              <div className="relative">
                <item.icon className="h-6 w-6 flex-shrink-0" />
                {!active && <Sparkles className="h-3 w-3 text-viverblue absolute -top-1 -right-1 animate-pulse" />}
              </div>
              {sidebarOpen && (
                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className="truncate font-bold">{item.title}</span>
                  <span className={cn(
                    "text-xs truncate",
                    active ? "text-white/90" : "text-viverblue/80"
                  )}>
                    {item.description}
                  </span>
                </div>
              )}
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-viverblue/20 via-purple-500/20 to-viverblue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
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
            "w-full justify-start gap-4 h-12 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
            !sidebarOpen && "justify-center px-3",
            active 
              ? "bg-red-500/20 text-red-400 border border-red-500/30 shadow-lg" 
              : "text-neutral-300 hover:text-red-400 hover:bg-red-500/10 hover:border hover:border-red-500/20"
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

    // Design regular para outros itens
    return (
      <Button
        key={item.href}
        variant="ghost"
        className={cn(
          "w-full justify-start gap-4 h-12 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
          !sidebarOpen && "justify-center px-3",
          active 
            ? "bg-white/10 text-white shadow-lg border border-white/20" 
            : "text-neutral-300 hover:text-white hover:bg-white/8 hover:shadow-md"
        )}
        asChild
      >
        <Link to={item.href}>
          <item.icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
            active ? "scale-110" : "group-hover:scale-105"
          )} />
          {sidebarOpen && (
            <span className="truncate">{item.title}</span>
          )}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex flex-col h-full px-3">
      <div className="flex flex-col space-y-3 flex-1">
        {/* Dashboard - Item principal */}
        <div className="mb-2">
          {renderNavButton(navigationItems[0])}
        </div>

        {/* Trilha de IA - Item hero */}
        <div className="mb-4">
          {renderNavButton(navigationItems[1])}
        </div>

        {/* Grupo de Aprendizado */}
        <div className="space-y-2 mb-4">
          {navigationItems.slice(2, 5).map(item => renderNavButton(item))}
        </div>

        {/* Grupo de Recursos */}
        <div className="space-y-2 mb-4">
          {navigationItems.slice(5, 8).map(item => renderNavButton(item))}
        </div>

        {/* Admin no final se existir */}
        {profile?.role === 'admin' && (
          <div className="mt-auto pt-4 border-t border-white/10">
            {renderNavButton(navigationItems[navigationItems.length - 1])}
          </div>
        )}
      </div>
    </div>
  );
};
