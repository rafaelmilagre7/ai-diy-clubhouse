
import { cn } from "@/lib/utils";
import { BaseContentProps } from "../BaseLayout";
import { MemberHeader } from "./MemberHeader";

export const MemberContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  children 
}: BaseContentProps) => {
  return (
    <div className={cn(
      "flex flex-1 flex-col min-h-screen transition-all duration-300 ease-in-out",
      // No desktop, sempre deixa espaço para sidebar (264px = w-64 + border)
      "md:ml-64"
    )}>
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};
