
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  sidebarOpen: boolean;
  badge?: number | null;
  children: React.ReactNode;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  href, 
  icon: Icon, 
  isActive,
  sidebarOpen,
  badge,
  children
}) => {
  return (
    <NavLink
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-white/10",
        isActive && "bg-white/10 text-white",
        !sidebarOpen && "justify-center px-2"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {sidebarOpen && (
        <>
          <span className="truncate">{children}</span>
          {badge && badge > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
