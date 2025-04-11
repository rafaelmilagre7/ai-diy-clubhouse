
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdminHeader } from "./AdminHeader";
import { Toaster } from "@/components/ui/sonner";

interface AdminContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminContent = ({ sidebarOpen, setSidebarOpen }: AdminContentProps) => {
  return (
    <main
      className={cn(
        "flex-1 overflow-x-hidden transition-all duration-300 ease-in-out",
        sidebarOpen ? "ml-64" : "ml-20"
      )}
    >
      <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Page content */}
      <div className="container py-6 px-4 md:px-6">
        <Outlet />
      </div>
      
      <Toaster position="top-right" />
    </main>
  );
};
