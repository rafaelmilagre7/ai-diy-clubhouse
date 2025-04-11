import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Users as UsersIcon,
  Settings,
  BarChart,
  ChevronLeft,
  ChevronRight,
  FileEdit
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin",
    },
    {
      title: "Soluções",
      icon: FileText,
      path: "/admin/solutions",
    },
    {
      title: "Nova Solução",
      icon: FileEdit,
      path: "/admin/solutions/new",
    },
    {
      title: "Usuários",
      icon: UsersIcon,
      path: "/admin/users",
    },
    {
      title: "Métricas",
      icon: BarChart,
      path: "/admin/analytics",
    },
    {
      title: "Configurações",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center">
              <img 
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                alt="VIVER DE IA Club" 
                className="h-8 w-auto" 
              />
            </Link>
          ) : (
            <Link to="/admin" className="mx-auto">
              <img 
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                alt="VIVER DE IA Club" 
                className="h-8 w-auto" 
              />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </Button>
        </div>
        
        <Separator />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 hover:bg-gray-100",
                location.pathname === item.path ? "bg-gray-100 font-medium" : "text-gray-900"
              )}
            >
              <item.icon size={20} className="text-viverblue" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>

        <Separator />
        
        {/* User menu */}
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 px-2",
                  !sidebarOpen && "justify-center"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{getInitials(profile?.name)}</AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col items-start text-sm">
                    <span className="font-medium">{profile?.name}</span>
                    <span className="text-xs text-muted-foreground">Administrador</span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/admin/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onSelect={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-x-hidden transition-all duration-300 ease-in-out",
          sidebarOpen ? "ml-64" : "ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background px-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <div className="container py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
