
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
      "flex flex-1 flex-col transition-all duration-300 ease-in-out",
      sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
    )}>
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
