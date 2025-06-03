
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
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto w-full pl-4 pr-4 py-6">
        {children}
      </main>
    </div>
  );
};
