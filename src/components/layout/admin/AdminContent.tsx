
import { cn } from "@/lib/utils";
import { AdminHeader } from "./AdminHeader";
import { BaseContentProps } from "../BaseLayout";

export const AdminContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  return (
    <div 
      className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        // No desktop, sempre deixa espaço para sidebar
        "md:ml-64"
      )}
    >
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8 w-full">
          {children}
        </div>
      </main>
    </div>
  );
};
