
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  sidebarOpen: boolean;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ 
  href, 
  label, 
  icon: Icon, 
  sidebarOpen 
}) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-sm px-sm py-sm rounded-lg transition-colors",
        isActive 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {sidebarOpen && (
        <span className="font-medium">{label}</span>
      )}
    </Link>
  );
};
