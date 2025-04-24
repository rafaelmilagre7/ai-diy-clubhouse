
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children?: ReactNode;
}

export const MemberContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: MemberContentProps) => {
  // Debug log para verificar quando o componente é renderizado
  console.log("MemberContent renderizando, sidebarOpen:", sidebarOpen);

  return (
    <main 
      className={cn(
        "flex-1 bg-background transition-all duration-300 ease-in-out",
        // Ajusta o margin-left baseado no estado da barra lateral
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]",
        // Sem margem em mobile (barra lateral sobrepõe)
        "ml-0"
      )}
    >
      {/* Cabeçalho mobile com botão do menu */}
      <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="mr-2"
          aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
        >
          <Menu size={24} />
        </Button>
        <div className="flex-1 flex justify-center">
          <img 
            src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
            alt="VIVER DE IA Club" 
            className="h-8 w-auto" 
          />
        </div>
        <div className="w-10"></div> {/* Espaçador para equilíbrio */}
      </div>

      {/* Área de conteúdo */}
      <div className="container py-6 md:py-8">
        {children || <Outlet />}
      </div>
    </main>
  );
};
