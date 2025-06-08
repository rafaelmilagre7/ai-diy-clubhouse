
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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

  const renderNavButton = (item: any) => (
    <Button
      key={item.href}
      variant={isActive(item.href) ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 h-8 px-2 text-sm font-normal transition-all duration-200",
        !sidebarOpen && "justify-center px-1",
        isActive(item.href) 
          ? "bg-viverblue text-white hover:bg-viverblue/90 shadow-sm" 
          : "text-neutral-300 hover:text-white hover:bg-white/5",
        item.special && !isActive(item.href) && "hover:bg-viverblue/10 border border-viverblue/20"
      )}
      asChild
    >
      <Link to={item.href}>
        <div className="flex items-center gap-2 min-w-0">
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {item.special && sidebarOpen && (
            <Sparkles className="h-3 w-3 text-viverblue animate-pulse flex-shrink-0" />
          )}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col items-start min-w-0 flex-1">
            <span className="truncate text-sm">{item.title}</span>
            {item.special && item.description && (
              <span className="text-xs text-viverblue/80 truncate">
                {item.description}
              </span>
            )}
          </div>
        )}
        {item.special && !sidebarOpen && (
          <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-viverblue rounded-full animate-pulse"></div>
        )}
      </Link>
    </Button>
  );

  const renderSectionHeader = (title: string, icon: React.ElementType) => {
    if (!sidebarOpen) return null;
    
    const IconComponent = icon;
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
        <IconComponent className="h-3.5 w-3.5 text-medium-contrast" />
        <span className="text-xs font-semibold text-medium-contrast uppercase tracking-wide">
          {title}
        </span>
      </div>
    );
  };

  const renderSeparator = () => (
    <div className="py-1.5">
      <Separator className="bg-neutral-700/30" />
    </div>
  );

  return (
    <div className="space-y-0.5 px-2">
      {/* Dashboard */}
      <div className="mb-2">
        {renderNavButton(dashboardItem)}
      </div>

      {renderSeparator()}

      {/* IA & Personalização */}
      {renderSectionHeader("IA & Personalização", Brain)}
      <div className="space-y-0.5 mb-2">
        {aiPersonalizationItems.map(renderNavButton)}
      </div>
      
      {renderSeparator()}

      {/* Aprendizado */}
      {renderSectionHeader("Aprendizado", GraduationCap)}
      <div className="space-y-0.5 mb-2">
        {learningItems.map(renderNavButton)}
      </div>
      
      {renderSeparator()}

      {/* Recursos */}
      {renderSectionHeader("Recursos", Zap)}
      <div className="space-y-0.5 mb-2">
        {resourceItems.map(renderNavButton)}
      </div>

      {/* Admin (só para admins) */}
      {adminItems.length > 0 && (
        <>
          {renderSeparator()}
          <div className="space-y-0.5">
            {adminItems.map(renderNavButton)}
          </div>
        </>
      )}
    </div>
  );
};
