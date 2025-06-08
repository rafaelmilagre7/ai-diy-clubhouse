
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
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

interface MemberSidebarNavItemsProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNavItems: React.FC<MemberSidebarNavItemsProps> = ({ sidebarOpen }) => {
  const location = useLocation();
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();

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
    }
  ];

  // Itens administrativos
  const adminItems = [];
  
  if (hasPermission('lms.manage')) {
    adminItems.push({
      title: "Área de Formação",
      href: "/formacao",
      icon: GraduationCap,
    });
  }

  if (profile?.role === 'admin') {
    adminItems.push({
      title: "Eventos",
      href: "/events",
      icon: Calendar,
    });
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const renderNavButton = (item: any) => (
    <Button
      key={item.href}
      variant={isActive(item.href) ? "default" : "ghost"}
      className={cn(
        "w-full justify-start gap-2 mb-1 relative",
        !sidebarOpen && "justify-center px-2",
        isActive(item.href) && "bg-viverblue hover:bg-viverblue/90",
        item.special && !isActive(item.href) && "hover:bg-viverblue/20 border border-viverblue/20"
      )}
      asChild
    >
      <Link to={item.href}>
        <div className="flex items-center gap-2">
          <item.icon className="h-4 w-4" />
          {item.special && sidebarOpen && (
            <Sparkles className="h-3 w-3 text-viverblue animate-pulse" />
          )}
        </div>
        {sidebarOpen && (
          <div className="flex flex-col items-start">
            <span>{item.title}</span>
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
      <div className="flex items-center gap-2 px-2 py-3 text-xs font-semibold text-medium-contrast uppercase tracking-wider">
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

      {/* Área Administrativa (se aplicável) */}
      {adminItems.length > 0 && (
        <>
          <div className="py-2">
            <Separator className="bg-neutral-700/50" />
          </div>
          {renderSectionHeader("Administração", Settings)}
          {adminItems.map(renderNavButton)}
        </>
      )}
    </div>
  );
};
