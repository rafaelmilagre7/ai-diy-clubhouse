
import React from "react";
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";
import { MemberHeader } from "./MemberHeader";

export const MemberContent = ({ sidebarOpen, setSidebarOpen, children }: BaseContentProps) => {
  return (
    <main
      className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out min-h-screen",
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <MemberHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Overlay para mobile quando sidebar está aberto */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </main>
  );
};
