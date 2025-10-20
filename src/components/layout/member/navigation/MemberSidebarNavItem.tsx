
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth';
import { getUserRoleName } from '@/lib/supabase/types';

interface MemberSidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  sidebarOpen: boolean;
  adminOnly?: boolean;
}

export const MemberSidebarNavItem: React.FC<MemberSidebarNavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  sidebarOpen,
  adminOnly = false
}) => {
  const { profile } = useAuth();

  // Se for admin only e o usuário não for admin, não mostrar
  if (adminOnly && getUserRoleName(profile) !== 'admin') {
    return null;
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-sm rounded-lg px-sm py-sm text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50",
          isActive && "bg-accent text-accent-foreground shadow-sm",
          !sidebarOpen && "justify-center px-sm"
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {sidebarOpen && <span className="truncate font-medium">{label}</span>}
    </NavLink>
  );
};
