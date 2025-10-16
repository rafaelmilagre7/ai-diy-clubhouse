
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface TooltipNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  sidebarOpen: boolean;
  badge?: string | number;
  isNew?: boolean;
  adminOnly?: boolean;
}

export const TooltipNavItem: React.FC<TooltipNavItemProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  sidebarOpen,
  badge,
  isNew = false,
  adminOnly = false
}) => {
  const navContent = (
    <NavLink
      to={to}
      className={({ isActive }) => {
        const pathname = window.location.pathname;
        
        // Lógica específica para /learning e /learning/certificates
        const isCertificatesActive = to === "/learning/certificates" && pathname === "/learning/certificates";
        const isLearningActive = to === "/learning" && pathname.startsWith("/learning") && pathname !== "/learning/certificates";
        
        // Lógica específica para /networking
        const isNetworkingActive = to === "/networking" && pathname === "/networking";
        
        // Lógica final: rotas específicas ou isActive padrão (exceto as com lógica customizada)
        const finalIsActive = 
          isCertificatesActive || 
          isLearningActive || 
          isNetworkingActive || 
          (isActive && to !== "/learning" && to !== "/networking");
        
        return cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative",
          "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          finalIsActive 
            ? "bg-gradient-to-r from-primary/15 to-primary/10 text-primary shadow-sm border border-primary/20" 
            : "text-muted-foreground hover:text-foreground",
          !sidebarOpen && "justify-center px-2 w-10 h-10",
          adminOnly && "bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20"
        );
      }}
    >
      <div className="relative flex items-center justify-center">
        <Icon className={cn(
          "h-5 w-5 flex-shrink-0 transition-all duration-200",
          "group-hover:scale-110",
          adminOnly && "text-orange-500"
        )} />
        {isNew && (
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse" />
        )}
      </div>
      
      {sidebarOpen && (
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className={cn(
            "truncate transition-colors duration-200",
            adminOnly && "text-orange-600 dark:text-orange-400 font-semibold"
          )}>
            {label}
          </span>
          {badge && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full font-medium">
              {badge}
            </span>
          )}
          {isNew && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-600 dark:text-green-400 rounded-full font-medium">
              Novo
            </span>
          )}
          {adminOnly && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full font-medium">
              Admin
            </span>
          )}
        </div>
      )}
    </NavLink>
  );

  if (!sidebarOpen) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            {navContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <div className="flex items-center gap-2">
              {label}
              {adminOnly && (
                <span className="px-1.5 py-0.5 text-xs bg-orange-500/20 text-orange-600 rounded">
                  Admin
                </span>
              )}
              {badge && (
                <span className="px-1.5 py-0.5 text-xs bg-primary/20 text-primary rounded">
                  {badge}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return navContent;
};
