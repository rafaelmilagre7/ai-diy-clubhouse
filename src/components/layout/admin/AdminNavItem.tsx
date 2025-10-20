
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminNavItemProps {
  label: string;
  icon: LucideIcon;
  href: string;
  isActive: boolean;
}

export const AdminNavItem = ({ label, icon: Icon, href, isActive }: AdminNavItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-sm px-sm py-sm rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-surface-elevated/50 text-foreground"
          : "text-muted-foreground hover:bg-surface-elevated/30 hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
};
