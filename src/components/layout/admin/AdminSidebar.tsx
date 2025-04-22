
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminUserMenu } from "./AdminUserMenu";

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const { profile } = useAuth();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background shadow-sm transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {sidebarOpen ? (
          <Link to="/admin" className="flex items-center">
            <img
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif"
              alt="VIVER DE IA Club"
              className="h-8 w-auto"
            />
          </Link>
        ) : (
          <Link to="/admin" className="mx-auto">
            <div className="h-8 w-8 flex items-center justify-center bg-viverblue rounded-full text-white font-bold">
              VI
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={sidebarOpen ? "ml-auto" : "mx-auto mt-2"}
          aria-label={sidebarOpen ? "Colapsar menu" : "Expandir menu"}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <AdminSidebarNav sidebarOpen={sidebarOpen} />
      </div>

      <AdminUserMenu
        sidebarOpen={sidebarOpen}
        profileName={profile?.name}
        profileEmail={profile?.email}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
      />
    </aside>
  );
};
