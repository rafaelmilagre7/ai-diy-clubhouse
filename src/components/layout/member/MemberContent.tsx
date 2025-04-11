
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MemberHeader } from "./MemberHeader";

interface MemberContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const MemberContent = ({ sidebarOpen, setSidebarOpen }: MemberContentProps) => {
  return (
    <main
      className={cn(
        "flex-1 overflow-x-hidden transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-20"
      )}
    >
      <MemberHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Page content */}
      <div className="container py-6">
        <Outlet />
      </div>
    </main>
  );
};
