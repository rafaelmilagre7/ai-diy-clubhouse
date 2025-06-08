
import { cn } from "@/lib/utils";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  const navigate = useNavigate();
  
  console.log('[AdminSidebar] Estado:', { sidebarOpen });

  const handleBackToMember = () => {
    navigate("/dashboard");
  };

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
        {/* Logo/Header com botão de toggle */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white p-1 h-8 w-8"
                  title="Recolher Sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white p-1 h-8 w-8"
                  title="Expandir Sidebar"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">A</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botão para voltar à área de membro */}
        <div className="p-3 border-b border-gray-700">
          {sidebarOpen ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToMember}
              className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Membro
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToMember}
              className="w-full p-2 text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
              title="Voltar para Área de Membro"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navegação */}
        <AdminSidebarNav sidebarOpen={sidebarOpen} />
      </div>
    </aside>
  );
};
