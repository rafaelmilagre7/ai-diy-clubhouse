
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
  Sparkles
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

  const menuItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Trilha de IA",
      href: "/trilha-implementacao",
      icon: Route,
      special: true,
      description: "Guia personalizado com IA"
    },
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
    },
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

  // Adicionar Área de Formação APENAS se tem permissão lms.manage
  if (hasPermission('lms.manage')) {
    menuItems.push({
      title: "Área de Formação",
      href: "/formacao",
      icon: GraduationCap,
    });
  }

  // Adicionar eventos se for admin
  if (profile?.role === 'admin') {
    menuItems.push({
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

  return (
    <>
      {menuItems.map((item) => (
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
      ))}
    </>
  );
};
