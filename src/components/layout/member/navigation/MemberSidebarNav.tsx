import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Home, GraduationCap, Users, Settings, HelpCircle, PencilLine } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MemberSidebarNav = ({ sidebarOpen }: { sidebarOpen: boolean }) => {
  return (
    <ScrollArea className="flex-1 px-4">
      <nav className="space-y-2 py-4">
        <Button
          variant="ghost"
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
          variant="ghost"
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
          variant="ghost"
          asChild
          className="w-full justify-start"
        >
          <Link to="/community">
            <Users className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Comunidade
            </span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          asChild
          className="w-full justify-start"
        >
          <Link to="/settings">
            <Settings className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Configurações
            </span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          asChild
          className="w-full justify-start"
        >
          <Link to="/help">
            <HelpCircle className="h-5 w-5 mr-2" />
            <span className={cn("flex-1", !sidebarOpen && "hidden")}>
              Ajuda
            </span>
          </Link>
        </Button>

        <Button
          variant="ghost"
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
      </nav>
    </ScrollArea>
  );
};
