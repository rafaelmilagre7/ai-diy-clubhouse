
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MemberUserMenu } from "./MemberUserMenu";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./navigation/MemberSidebarNav";

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  getInitials: (name: string | null) => string;
}

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}: MemberSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo area */}
      <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <Separator />

      {/* Navigation */}
      <MemberSidebarNav sidebarOpen={sidebarOpen} />

      {/* User menu at bottom of sidebar */}
      <div className="mt-auto">
        <Separator />
        <MemberUserMenu 
          sidebarOpen={sidebarOpen} 
          profileName={profileName}
          profileEmail={profileEmail}
          profileAvatar={profileAvatar}
          getInitials={getInitials}
        />
      </div>
    </aside>
  );
};
