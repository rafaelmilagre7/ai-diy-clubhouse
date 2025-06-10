
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminUserMenu } from "./AdminUserMenu";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { Separator } from "@/components/ui/separator";

interface AdminContentProps {
  children: React.ReactNode;
}

export const AdminContent = ({ children }: AdminContentProps) => {
  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        
        <div className="flex-1">
          <h1 className="font-semibold">Painel Administrativo</h1>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <AdminUserMenu />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl w-full">
          {children}
        </div>
      </div>
    </main>
  );
};
