
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { AdminUserProfile } from "./AdminUserProfile";
import { AdminSidebarNav } from "./AdminSidebarNav";

export const AdminSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <AdminUserProfile />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <AdminSidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          Painel Administrativo
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
