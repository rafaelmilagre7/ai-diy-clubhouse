
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
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-white/10 text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
};
