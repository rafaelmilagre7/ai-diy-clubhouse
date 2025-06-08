
import { cn } from "@/lib/utils";
import { MemberUserMenu } from "./MemberUserMenu";
import { SidebarLogo } from "./navigation/SidebarLogo";
import { MemberSidebarNav } from "./MemberSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const MemberSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials
}: BaseSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-[#0F111A] border-r border-white/5 transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        // Em desktops, sempre visível
        "md:translate-x-0",
        // Em mobile, mostrar apenas quando aberto
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Área do logo */}
        <SidebarLogo sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="my-1 px-3">
          <div className="h-px bg-white/5"></div>
        </div>

        {/* Navegação */}
        <MemberSidebarNav sidebarOpen={sidebarOpen} />

        {/* Menu do usuário no rodapé da barra lateral */}
        <div className="mt-auto">
          <div className="my-1 px-3">
            <div className="h-px bg-white/5"></div>
          </div>
          <MemberUserMenu 
            sidebarOpen={sidebarOpen} 
            profileName={profileName}
            profileEmail={profileEmail}
            profileAvatar={profileAvatar}
            getInitials={getInitials || (() => "U")}
          />
        </div>
      </div>
    </aside>
  );
};
