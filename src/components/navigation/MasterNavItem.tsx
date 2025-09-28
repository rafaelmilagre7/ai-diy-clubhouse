import React from 'react';
import { NavLink } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHierarchicalPermissions } from '@/hooks/useHierarchicalPermissions';

interface MasterNavItemProps {
  sidebarOpen?: boolean;
}

export const MasterNavItem: React.FC<MasterNavItemProps> = ({ sidebarOpen = true }) => {
  const { permissions, loading } = useHierarchicalPermissions();

  if (loading || !permissions.isMasterUser) {
    return null;
  }

  return (
    <NavLink
      to="/master-dashboard"
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50",
          isActive && "bg-accent text-accent-foreground shadow-sm",
          !sidebarOpen && "justify-center px-2"
        )
      }
    >
      <Crown className="h-5 w-5 flex-shrink-0 text-yellow-600" />
      {sidebarOpen && <span className="truncate font-medium">Gestão de Equipe</span>}
    </NavLink>
  );
};