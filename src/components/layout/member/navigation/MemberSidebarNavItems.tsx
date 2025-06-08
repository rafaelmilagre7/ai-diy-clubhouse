
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

  // Seção principal - Dashboard
  const dashboardItem = {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  };

  // Seção IA & Personalização
  const aiPersonalizationItems = [
    {
      title: "Trilha de IA",
      href: "/trilha-implementacao",
      icon: Route,
      special: true,
      description: "Guia personalizado com IA"
    }
  ];

  // Seção principal - Soluções e Aprendizado
  const mainItems = [
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

  // Seção Ferramentas e Comunidade
  const toolsAndCommunityItems = [
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

  // Itens administrativos (só painel admin para admins reais)
  const adminItems = [];
  
  if (profile?.role === 'admin') {
    adminItems.push({
      title: "Painel Admin",
      href: "/admin",
      icon: Shield,
    });
  }

  // Lógica de ativação mais específica para evitar conflitos
  const isActive = (href: string) => {
    const currentPath = location.pathname;
    
    // Para o dashboard, deve ser exato
    if (href === '/dashboard') {
      return currentPath === href;
    }
    
    // Para certificados, deve ser exato
    if (href === '/learning/certificates') {
      return currentPath === href;
    }
    
    // Para cursos, não deve ativar se estivermos em certificados
    if (href === '/learning') {
      return currentPath.startsWith(href) && !currentPath.includes('/certificates');
    }
    
    // Para outros, usar startsWith
    return currentPath.startsWith(href);
  };

  const renderNavButton = (item: any) => (
    <Button
      key={item.href}
      variant={isActive(item.href) ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 mb-1 h-10 px-3 py-2 transition-all",
        !sidebarOpen && "justify-center px-2",
        isActive(item.href) 
          ? "bg-viverblue text-white hover:bg-viverblue/90" 
          : "text-neutral-300 hover:text-white hover:bg-white/10",
        item.special && !isActive(item.href) && "hover:bg-viverblue/20 border border-viverblue/20"
      )}
      asChild
    >
      <Link to={item.href}>
        <div className="flex items-center gap-3">
          <item.icon className="h-5 w-5 flex-shrink-0" />
          {item.special && sidebarOpen && (
            <Sparkles className="h-3 w-3 text-viverblue animate-pulse" />
          )}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col items-start">
            <span className="truncate">{item.title}</span>
            {item.special && item.description && (
              <span className="text-xs text-viverblue opacity-80">
                {item.description}
              </span>
            )}
          </div>
        )}
        {item.special && !sidebarOpen && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-viverblue rounded-full animate-pulse"></div>
        )}
      </Link>
    </Button>
  );

  const renderSectionHeader = (title: string, icon: React.ElementType) => {
    if (!sidebarOpen) return null;
    
    const IconComponent = icon;
    return (
      <div className="flex items-center gap-2 px-3 py-3 text-xs font-semibold text-medium-contrast uppercase tracking-wider">
        <IconComponent className="h-4 w-4" />
        <span>{title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {/* Dashboard */}
      {renderNavButton(dashboardItem)}
      
      <div className="py-2">
        <Separator className="bg-neutral-700/50" />
      </div>

      {/* IA & Personalização */}
      {renderSectionHeader("IA & Personalização", Brain)}
      {aiPersonalizationItems.map(renderNavButton)}
      
      <div className="py-2">
        <Separator className="bg-neutral-700/50" />
      </div>

      {/* Soluções e Aprendizado */}
      {renderSectionHeader("Aprendizado", GraduationCap)}
      {mainItems.map(renderNavButton)}
      
      <div className="py-2">
        <Separator className="bg-neutral-700/50" />
      </div>

      {/* Ferramentas e Comunidade */}
      {renderSectionHeader("Recursos", Zap)}
      {toolsAndCommunityItems.map(renderNavButton)}

      {/* Painel Admin (só para admins) */}
      {adminItems.length > 0 && (
        <>
          <div className="py-2">
            <Separator className="bg-neutral-700/50" />
          </div>
          {adminItems.map(renderNavButton)}
        </>
      )}
    </div>
  );
};
