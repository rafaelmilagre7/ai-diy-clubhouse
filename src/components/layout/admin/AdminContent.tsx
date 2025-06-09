
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
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto max-w-7xl mx-auto p-8 w-full">
        {children}
      </main>
    </div>
  );
};
