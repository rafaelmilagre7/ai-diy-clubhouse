
import { cn } from "@/lib/utils";
import { MemberHeader } from "./MemberHeader";
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
        sidebarOpen ? "md:ml-64" : "md:ml-[70px]"
      )}
    >
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main className="flex-1 overflow-auto">
        <div className="w-full h-full px-2 md:px-4 py-4">
          {children}
        </div>
      </main>
    </div>
  );
};
