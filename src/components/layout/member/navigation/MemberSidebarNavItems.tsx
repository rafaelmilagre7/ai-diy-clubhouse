
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
  Brain,
  Zap,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { profile } = useAuth();

  // Dashboard principal
  const dashboardItem = {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  };

  // IA & Personalização
  const aiPersonalizationItems = [
    {
      title: "Trilha de IA",
      href: "/trilha-implementacao",
      icon: Route,
      special: true,
      description: "Guia personalizado"
    }
  ];

  // Aprendizado
  const learningItems = [
    {
      title: "Soluções",
      href: "/solutions",
      icon: Lightbulb,
    },
    {
      title: "Cursos",
      href: "/learning",
      icon: GraduationCap,
    },
    {
      title: "Certificados",
      href: "/learning/certificates",
      icon: Award,
    }
  ];

  // Recursos
  const resourceItems = [
    {
      title: "Ferramentas",
      href: "/tools",
      icon: Settings,
    },
    {
      title: "Comunidade",
      href: "/comunidade",
      icon: MessageSquare,
    },
    {
      title: "Eventos",
      href: "/events",
      icon: Calendar,
    }
  ];

  // Admin (só para admins)
  const adminItems = [];
  if (profile?.role === 'admin') {
    adminItems.push({
      title: "Painel Admin",
      href: "/admin",
      icon: Shield,
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

  const renderNavButton = (item: any, isSpecial = false) => (
    <Button
      key={item.href}
      variant={isActive(item.href) ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 h-11 px-4 text-sm font-medium transition-all duration-200 rounded-xl group",
        !sidebarOpen && "justify-center px-3",
        isActive(item.href) 
          ? "bg-gradient-to-r from-viverblue to-viverblue/80 text-white shadow-lg shadow-viverblue/25 hover:shadow-viverblue/40" 
          : "text-neutral-300 hover:text-white hover:bg-gradient-to-r hover:from-white/8 hover:to-white/4 hover:shadow-md",
        isSpecial && !isActive(item.href) && "relative overflow-hidden border border-viverblue/30 hover:border-viverblue/50 bg-gradient-to-r from-viverblue/5 to-transparent"
      )}
      asChild
    >
      <Link to={item.href}>
        <div className="flex items-center gap-3 min-w-0">
          <item.icon className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-200",
            isActive(item.href) ? "scale-110" : "group-hover:scale-105"
          )} />
          {isSpecial && sidebarOpen && (
            <Sparkles className="h-4 w-4 text-viverblue animate-pulse flex-shrink-0" />
          )}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="truncate font-medium">{item.title}</span>
            {isSpecial && item.description && (
              <span className="text-xs text-viverblue/90 truncate">
                {item.description}
              </span>
            )}
          </div>
        )}
        {isSpecial && !sidebarOpen && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
        )}
        {isSpecial && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-viverblue/5 to-viverblue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        )}
      </Link>
    </Button>
  );

  const renderSectionHeader = (title: string, icon: React.ElementType) => {
    if (!sidebarOpen) return null;
    
    const IconComponent = icon;
    return (
      <div className="flex items-center gap-3 px-4 py-3 mb-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-neutral-700/50 to-neutral-600/30">
          <IconComponent className="h-4 w-4 text-neutral-300" />
        </div>
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
    );
  };

  const renderSeparator = () => (
    <div className="my-6 mx-4">
      <div className="h-px bg-gradient-to-r from-transparent via-neutral-700/60 to-transparent"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Dashboard Principal */}
      <div className="px-3 mb-4">
        {renderNavButton(dashboardItem)}
      </div>

      {renderSeparator()}

      {/* IA & Personalização */}
      <div className="mb-6">
        {renderSectionHeader("IA & Personalização", Brain)}
        <div className="px-3 space-y-2">
          {aiPersonalizationItems.map(item => renderNavButton(item, true))}
        </div>
      </div>
      
      {renderSeparator()}

      {/* Aprendizado */}
      <div className="mb-6">
        {renderSectionHeader("Aprendizado", GraduationCap)}
        <div className="px-3 space-y-2">
          {learningItems.map(item => renderNavButton(item))}
        </div>
      </div>
      
      {renderSeparator()}

      {/* Recursos */}
      <div className="mb-6">
        {renderSectionHeader("Recursos", Zap)}
        <div className="px-3 space-y-2">
          {resourceItems.map(item => renderNavButton(item))}
        </div>
      </div>

      {/* Admin (só para admins) */}
      {adminItems.length > 0 && (
        <>
          {renderSeparator()}
          <div className="px-3 space-y-2 mt-auto">
            {adminItems.map(item => renderNavButton(item))}
          </div>
        </>
      )}
    </div>
  );
};
