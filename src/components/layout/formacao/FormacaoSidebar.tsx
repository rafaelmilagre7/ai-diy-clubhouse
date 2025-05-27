
import { cn } from "@/lib/utils";
import { FormacaoUserMenu } from "./FormacaoUserMenu";
import { FormacaoSidebarNav } from "./FormacaoSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const FormacaoSidebar = ({ 
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
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-center">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold">Formação</h1>
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-sm font-bold">F</span>
              </div>
            )}
          </div>
        </div>

        {/* Navegação */}
        <FormacaoSidebarNav sidebarOpen={sidebarOpen} />

        {/* Menu do usuário no rodapé */}
        <div className="mt-auto border-t border-border">
          <FormacaoUserMenu 
            sidebarOpen={sidebarOpen} 
            profileName={profileName}
            profileEmail={profileEmail}
            profileAvatar={profileAvatar}
            getInitials={getInitials || (() => "F")}
          />
        </div>
      </div>
    </aside>
  );
};
