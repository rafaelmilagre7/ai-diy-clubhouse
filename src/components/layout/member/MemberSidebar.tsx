
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MemberUserMenu } from "./MemberUserMenu";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./navigation/MemberSidebarNav";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        "fixed top-0 left-0 z-50 h-full w-64 flex-shrink-0 flex-col border-r bg-background transition-all duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-[70px]"
      )}
    >
      {/* Botão de fechar em mobile */}
      <div className="md:hidden absolute right-4 top-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex h-full flex-col">
        {/* Logo no topo da sidebar */}
        <div
          className={cn(
            "flex h-16 items-center border-b px-4",
            !sidebarOpen && "md:justify-center"
          )}
        >
          <SidebarLogo sidebarOpen={sidebarOpen} />
        </div>

        {/* Navegação principal */}
        <div className="flex-1 overflow-auto py-6">
          <MemberSidebarNav sidebarOpen={sidebarOpen} />
        </div>

        <Separator />

        {/* Área do usuário no rodapé */}
        <div className="p-4">
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
