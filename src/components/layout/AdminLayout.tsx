
import { ReactNode, useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminHeader } from "./admin/AdminHeader";
import { AdminContent } from "./admin/AdminContent";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <AdminContent>
          {children || <Outlet />}
        </AdminContent>
      </div>
    </div>
  );
};

export default AdminLayout;
