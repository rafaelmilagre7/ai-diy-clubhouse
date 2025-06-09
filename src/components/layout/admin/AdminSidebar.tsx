
import { AdminUserProfile } from "./AdminUserProfile";
import { AdminSidebarNav } from "./AdminSidebarNav";

export const AdminSidebar = () => {
  return (
    <div className="w-64 bg-[#0F111A] border-r border-white/5 flex flex-col h-screen">
      {/* Header fixo */}
      <div className="flex-shrink-0 p-4">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        
        {/* Perfil do usuário */}
        <AdminUserProfile />
        
        <div className="h-px bg-white/5 my-4"></div>
      </div>
      
      {/* Área de navegação que expande e contrai */}
      <div className="flex-1 flex flex-col min-h-0">
        <AdminSidebarNav />
      </div>
    </div>
  );
};
