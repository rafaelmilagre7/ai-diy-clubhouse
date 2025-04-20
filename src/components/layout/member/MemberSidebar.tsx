
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
  signOut: () => Promise<void>;
}

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut
}: MemberSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background shadow-sm transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-0 md:w-[70px]"
      )}
    >
      <div className="flex flex-col h-full">
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
            signOut={signOut}
          />
        </div>
      </div>
    </aside>
  );
};
