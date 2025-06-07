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
  Award
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
            "w-full justify-start gap-2 mb-1",
            !sidebarOpen && "justify-center px-2",
            isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
          )}
          asChild
        >
          <Link to={item.href}>
            <item.icon className="h-4 w-4" />
            {sidebarOpen && <span>{item.title}</span>}
          </Link>
        </Button>
      ))}
    </>
  );
};
