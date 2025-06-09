
import { AdminUserProfile } from "./AdminUserProfile";
import { AdminSidebarNav } from "./AdminSidebarNav";
import { AdminSidebarFooter } from "./AdminSidebarFooter";

export const AdminSidebar = () => {
  return (
    <div className="w-64 bg-[#0F111A] border-r border-white/5 flex flex-col">
      <div className="p-4">
        {/* Logo/Header */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        
        {/* Perfil do usuário */}
        <AdminUserProfile />
        
        <div className="h-px bg-white/5 my-4"></div>
        
        {/* Navegação */}
        <AdminSidebarNav />
      </div>
      
      {/* Footer */}
      <AdminSidebarFooter />
    </div>
  );
};
