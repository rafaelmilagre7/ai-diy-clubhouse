import React from "react";
import { NavLink } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MasterSidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  sidebarOpen: boolean;
}

export const MasterSidebarNavItem: React.FC<MasterSidebarNavItemProps> = ({
  to,
  icon: Icon,
  label,
  sidebarOpen,
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-accent/50",
          isActive && "bg-accent text-accent-foreground shadow-sm",
          !sidebarOpen && "justify-center px-2"
        )
      }
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {sidebarOpen && <span className="truncate font-medium">{label}</span>}
    </NavLink>
  );
};