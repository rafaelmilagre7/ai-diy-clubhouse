
import React from "react";
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";

export const MemberContent: React.FC<BaseContentProps> = ({ 
  children, 
  sidebarOpen 
}) => {
  return (
    <main
      className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        // Em desktop, sempre deixar espaço para sidebar
        "md:ml-0",
        // Ajustar margin baseado no estado do sidebar
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <div className="min-h-screen bg-[#0F111A]">
        {children}
      </div>
    </main>
  );
};
