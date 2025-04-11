
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MemberHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberHeader = ({ sidebarOpen, setSidebarOpen }: MemberHeaderProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="ml-auto flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-viverblue text-xs text-white">
            2
          </span>
        </Button>
      </div>
    </header>
  );
};
