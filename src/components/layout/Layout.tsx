import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Home, 
  Award, 
  BookOpenCheck, 
  Calendar, 
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
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

const Layout = () => {
  const { user, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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
            <Link to="/dashboard" className="flex items-center">
              <img 
                src="https://milagredigital.com/wp-content/uploads/2025/04/viverdeiaclub.avif" 
                alt="VIVER DE IA Club" 
                className="h-8 w-auto" 
              />
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
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
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Home size={20} className="text-viverblue" />
            {sidebarOpen && <span>Dashboard</span>}
          </Link>
          
          <div className={cn("mt-3 mb-2", sidebarOpen ? "px-3" : "text-center")}>
            {sidebarOpen ? (
              <span className="text-xs font-semibold uppercase text-gray-500">Trilhas</span>
            ) : (
              <Separator />
            )}
          </div>
          
          <Link
            to="/dashboard?category=revenue"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <div className="h-2 w-2 rounded-full bg-revenue" />
            {sidebarOpen && <span>Aumento de Receita</span>}
          </Link>
          
          <Link
            to="/dashboard?category=operational"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <div className="h-2 w-2 rounded-full bg-operational" />
            {sidebarOpen && <span>Otimização Operacional</span>}
          </Link>
          
          <Link
            to="/dashboard?category=strategy"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <div className="h-2 w-2 rounded-full bg-strategy" />
            {sidebarOpen && <span>Gestão Estratégica</span>}
          </Link>
          
          <div className={cn("mt-3 mb-2", sidebarOpen ? "px-3" : "text-center")}>
            {sidebarOpen ? (
              <span className="text-xs font-semibold uppercase text-gray-500">Acompanhamento</span>
            ) : (
              <Separator />
            )}
          </div>
          
          <Link
            to="/profile"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Award size={20} className="text-viverblue" />
            {sidebarOpen && <span>Conquistas</span>}
          </Link>
          
          <Link
            to="/profile"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <BookOpenCheck size={20} className="text-viverblue" />
            {sidebarOpen && <span>Meu Progresso</span>}
          </Link>
          
          <Link
            to="/dashboard?calendar=true"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Calendar size={20} className="text-viverblue" />
            {sidebarOpen && <span>Calendário</span>}
          </Link>
          
          <Link
            to="/community"
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-gray-900 hover:bg-gray-100"
          >
            <Users size={20} className="text-viverblue" />
            {sidebarOpen && <span>Comunidade</span>}
          </Link>
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
                    <span className="text-muted-foreground text-xs truncate max-w-[150px]">
                      {profile?.email}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link to="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
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
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-viverblue text-xs text-white">
                2
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

export default Layout;
