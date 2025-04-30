
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth";
import { 
  LayoutDashboard,
  Book,
  BookOpen,
  GraduationCap,
  Settings,
  User,
  ChevronLeft,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

interface FormacaoSidebarNavProps {
  sidebarOpen: boolean;
}

export const FormacaoSidebarNav = ({ sidebarOpen }: FormacaoSidebarNavProps) => {
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Log para verificar se o componente está sendo renderizado
  console.log("FormacaoSidebarNav renderizando, sidebarOpen:", sidebarOpen);

  const menuItems = [
    {
      title: "Dashboard",
      href: "/formacao",
      icon: LayoutDashboard,
    },
    {
      title: "Cursos",
      href: "/formacao/cursos",
      icon: GraduationCap,
    },
    {
      title: "Aulas",
      href: "/formacao/aulas",
      icon: BookOpen,
    },
    {
      title: "Materiais",
      href: "/formacao/materiais",
      icon: Book,
    },
    {
      title: "Alunos",
      href: "/formacao/alunos",
      icon: Users,
    },
    {
      title: "Configurações",
      href: "/formacao/configuracoes",
      icon: Settings,
    },
    {
      title: "Perfil",
      href: "/profile",
      icon: User,
    }
  ];

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="space-y-4 py-4">
      <div className="px-3 space-y-1">
        {menuItems.map((item) => (
          <Button
            key={item.href}
            variant={isActive(item.href) ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-2",
              !sidebarOpen && "justify-center",
              isActive(item.href) && "bg-viverblue hover:bg-viverblue/90"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          </Button>
        ))}

        {isAdmin && (
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start gap-2 border-viverblue text-viverblue hover:bg-viverblue/10 mt-4",
              !sidebarOpen && "justify-center"
            )}
            asChild
          >
            <Link to="/admin">
              <ChevronLeft className="h-4 w-4" />
              {sidebarOpen && <span>Voltar para Admin</span>}
            </Link>
          </Button>
        )}
        
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 mt-2",
            !sidebarOpen && "justify-center"
          )}
          asChild
        >
          <Link to="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            {sidebarOpen && <span>Voltar ao Dashboard</span>}
          </Link>
        </Button>
      </div>
    </div>
  );
};
