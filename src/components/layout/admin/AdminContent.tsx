
import { cn } from "@/lib/utils";
import { AdminHeader } from "./AdminHeader";

interface AdminContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  children: React.ReactNode;
}

export const AdminContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: AdminContentProps) => {
  return (
    <div 
      className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden min-h-screen"
      )}
    >
      <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex-1 overflow-auto max-w-7xl mx-auto p-8 w-full">
        {children}
      </main>
    </div>
  );
};
