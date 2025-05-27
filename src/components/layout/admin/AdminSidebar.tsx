
import { cn } from "@/lib/utils";
import { AdminUserMenu } from "./AdminUserMenu";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut
}: BaseSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-center">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-sm font-bold">A</span>
              </div>
            )}
          </div>
        </div>

        {/* Navegação */}
        <AdminSidebarNav sidebarOpen={sidebarOpen} />

        {/* Menu do usuário no rodapé */}
        <div className="mt-auto border-t border-gray-700">
          <AdminUserMenu 
            sidebarOpen={sidebarOpen} 
            profileName={profileName}
            profileEmail={profileEmail}
            profileAvatar={profileAvatar}
            getInitials={getInitials || (() => "A")}
            signOut={signOut || (() => Promise.resolve())}
          />
        </div>
      </div>
    </aside>
  );
};
