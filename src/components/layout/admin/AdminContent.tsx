
import { cn } from "@/lib/utils";
import { AdminHeader } from "./AdminHeader";
import { BaseContentProps } from "../BaseLayout";

export const AdminContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  console.log('[AdminContent] Estado:', { sidebarOpen, hasChildren: !!children });

  return (
    <div 
      className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        "bg-gradient-to-br from-background via-surface-subtle to-surface-elevated",
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
