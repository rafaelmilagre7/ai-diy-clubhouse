
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth/OptimizedAuthContext';
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
          "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10",
          isActive && "bg-white/10 text-white",
          !sidebarOpen && "justify-center px-2"
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {sidebarOpen && <span className="truncate">{label}</span>}
    </NavLink>
  );
};
