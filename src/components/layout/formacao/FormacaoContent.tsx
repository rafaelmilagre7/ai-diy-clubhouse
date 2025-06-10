
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export const FormacaoContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header adaptativo */}
      <header className="bg-background border-b border-border p-4 sticky top-0 z-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botão de toggle sempre visível em mobile, apenas quando fechado em desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={cn(
                "p-2 rounded-md hover:bg-accent",
                "md:hidden", // Sempre visível em mobile
                !sidebarOpen && "md:flex" // Visível em desktop apenas quando sidebar fechada
              )}
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Área de Formação</h1>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal com padding adequado */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
};
