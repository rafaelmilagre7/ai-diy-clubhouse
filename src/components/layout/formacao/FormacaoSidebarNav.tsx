
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen,
  Play,
  FileText,
  Settings,
  ArrowLeft,
  GraduationCap
} from "lucide-react";
import { AdminNavItem } from "../admin/AdminNavItem";
import { cn } from "@/lib/utils";

interface FormacaoSidebarNavProps {
  sidebarOpen: boolean;
}

export const FormacaoSidebarNav = ({ sidebarOpen }: FormacaoSidebarNavProps) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Área de Membro",
      icon: ArrowLeft,
      href: "/dashboard",
      isActive: false
    },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/formacao",
      isActive: location.pathname === "/formacao"
    },
    {
      label: "Cursos",
      icon: BookOpen,
      href: "/formacao/cursos",
      isActive: location.pathname.startsWith("/formacao/cursos")
    },
    {
      label: "Aulas",
      icon: Play,
      href: "/formacao/aulas",
      isActive: location.pathname.startsWith("/formacao/aulas")
    },
    {
      label: "Materiais",
      icon: FileText,
      href: "/formacao/materiais",
      isActive: location.pathname.startsWith("/formacao/materiais")
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/formacao/configuracoes",
      isActive: location.pathname.startsWith("/formacao/configuracoes")
    }
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="space-y-1 px-4">
        {navigationItems.map((item) => (
          <div
            key={item.href}
            className={cn(
              "flex items-center rounded-lg transition-colors hover:bg-accent",
              item.isActive && "bg-accent"
            )}
          >
            <a
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full transition-colors",
                item.isActive 
                  ? "text-accent-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", !sidebarOpen && "mx-auto")} />
              {sidebarOpen && <span>{item.label}</span>}
            </a>
          </div>
        ))}
      </div>
    </nav>
  );
};
