
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Home, GraduationCap, Trophy, Wrench, Gift, PencilLine, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MemberSidebarNav = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  const location = useLocation();
  
  return (
    <ScrollArea className="flex-1 px-4">
      <nav className="space-y-2 py-4">
        <Button
          variant={location.pathname === "/dashboard" || location.pathname === "/" ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/dashboard">
            <Home className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Dashboard
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname === "/onboarding" ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/onboarding">
            <Users className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Onboarding
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/solutions") || location.pathname.startsWith("/solution/") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/solutions">
            <GraduationCap className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Soluções
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/tools") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/tools">
            <Wrench className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Ferramentas
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/benefits") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/benefits">
            <Gift className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Benefícios
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/achievements") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/achievements">
            <Trophy className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Conquistas
            </span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/suggestions") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/suggestions">
            <PencilLine className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Sugestões
            </span>
          </Link>
        </Button>
        
        <Button
          variant={location.pathname.startsWith("/profile") ? "default" : "ghost"}
          asChild
          className="w-full justify-start"
        >
          <Link to="/profile">
            <User className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Perfil
            </span>
          </Link>
        </Button>
      </nav>
    </ScrollArea>
  );
};
