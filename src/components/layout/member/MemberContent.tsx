
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
        <div className="max-w-full mx-auto p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
