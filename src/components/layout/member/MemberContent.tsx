
import React from "react";
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";
import { MemberHeader } from "./MemberHeader";

export const MemberContent = ({ sidebarOpen, setSidebarOpen, children }: BaseContentProps) => {
  return (
    <main
      className={cn(
        "flex flex-col flex-1 transition-all duration-300 ease-in-out min-h-screen",
        "bg-gradient-to-br from-background via-surface-subtle to-surface-elevated",
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <MemberHeader 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen}
      />
      
      {/* Content area with better spacing and styling */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};
