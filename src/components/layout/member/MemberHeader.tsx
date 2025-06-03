
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface MemberHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberHeader = ({
  sidebarOpen,
  setSidebarOpen
}: MemberHeaderProps) => {
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 bg-[#0F111A] border-b border-white/10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleSidebar}
          className="md:hidden text-white hover:bg-white/10"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="hidden md:flex items-center gap-2 text-white/60 text-sm">
          <span>Dashboard</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <Search className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
