
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
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
  return (
    <main 
      className={cn(
        "flex-1 bg-[#0F111A] transition-all duration-300 ease-in-out",
        // Ajusta o margin-left baseado no estado da barra lateral
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]",
        // Sem margem em mobile (barra lateral sobrepõe)
        "ml-0"
      )}
    >
      {/* Área de conteúdo */}
      <div className="container py-6 md:py-8">
        {children || <Outlet />}
      </div>
    </main>
  );
};
