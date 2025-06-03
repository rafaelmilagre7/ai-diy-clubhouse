
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";

export const MemberContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  return (
    <div 
      className={cn(
        "flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        // Em mobile, não tem margem (sidebar fica sobreposta)
        // Em desktop, margem baseada no estado da sidebar (sem espaço extra)
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};
