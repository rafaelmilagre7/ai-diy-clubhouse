
import { cn } from "@/lib/utils";
import { FormacaoSidebarNav } from "./FormacaoSidebarNav";
import { BaseSidebarProps } from "../BaseLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const FormacaoSidebar = ({ 
  sidebarOpen, 
  setSidebarOpen
}: BaseSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-background border-r border-border transition-all duration-300 ease-in-out",
        // Estados da sidebar
        sidebarOpen ? "w-64" : "w-sidebar-collapsed",
        // Responsividade mobile
        "md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header com logo e botão de fechar */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <>
                <h1 className="text-xl font-bold">Formação</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="hidden md:flex p-1 h-auto"
                  aria-label="Fechar sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <div className="flex justify-center w-full">
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">F</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navegação */}
        <FormacaoSidebarNav sidebarOpen={sidebarOpen} />
      </div>
    </aside>
  );
};
