
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { MemberUserMenu } from "./MemberUserMenu";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./MemberSidebarNav";

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
  // Debug log para verificar quando o componente é renderizado
  console.log("MemberSidebar renderizando, sidebarOpen:", sidebarOpen);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        // Em desktops, sempre visível
        "md:translate-x-0",
        // Em mobile, mostrar apenas quando aberto
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
      style={{ boxShadow: "0 0 20px rgba(0,0,0,0.05)" }}
    >
      <div className="flex flex-col h-full">
        {/* Área do logo */}
        <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <Separator />

        {/* Navegação */}
        <MemberSidebarNav sidebarOpen={sidebarOpen} />

        {/* Menu do usuário no rodapé da barra lateral */}
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
