
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

interface MemberHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberHeader = ({ sidebarOpen, setSidebarOpen }: MemberHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-[#0F111A] px-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-2 md:hidden text-neutral-300 hover:bg-[#181A2A]"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="md:hidden">
          <Link to="/dashboard">
            <img 
              src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
              alt="VIVER DE IA Club" 
              className="h-8 w-auto" 
            />
          </Link>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-neutral-300 hover:bg-[#181A2A]"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-neutral-300 hover:bg-[#181A2A]"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};
