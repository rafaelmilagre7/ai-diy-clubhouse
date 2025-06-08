
import { cn } from "@/lib/utils";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";

export const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  console.log('[AdminSidebar] Estado:', { sidebarOpen });

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-gray-900 border-r border-gray-700 transition-all duration-300 ease-in-out",
        sidebarOpen ? "w-64" : "w-[70px]",
        // Em desktops, sempre visível
        "md:translate-x-0",
        // Em mobile, mostrar apenas quando aberto
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
                <span className="text-sm font-bold text-white">A</span>
              </div>
            )}
          </div>
        </div>

        {/* Navegação */}
        <AdminSidebarNav sidebarOpen={sidebarOpen} />
      </div>
    </aside>
  );
};
