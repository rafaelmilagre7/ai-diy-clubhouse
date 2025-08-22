
import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen,
  Play,
  FileText,
  ArrowLeft,
  GraduationCap,
  Tags,
  MessageSquare
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
      label: "Voltar para Admin",
      icon: ArrowLeft,
      href: "/admin",
      isActive: false,
      isBackLink: true
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
      label: "Comentários das Aulas",
      icon: MessageSquare,
      href: "/admin/learning-comments",
      isActive: location.pathname.startsWith("/admin/learning-comments")
    },
    {
      label: "Gestão de Tags",
      icon: Tags,
      href: "/formacao/tags",
      isActive: location.pathname.startsWith("/formacao/tags")
    },
    {
      label: "Materiais",
      icon: FileText,
      href: "/formacao/materiais",
      isActive: location.pathname.startsWith("/formacao/materiais")
    },
  ];

  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <div className="space-y-1 px-4">
        {navigationItems.map((item, index) => (
          <div key={item.href}>
            <div
              className={cn(
                "flex items-center rounded-lg transition-colors hover:bg-accent",
                item.isActive && "bg-accent"
              )}
            >
              <Link
                to={item.href}
                state={{ from: location.pathname }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg w-full transition-colors",
                  item.isActive 
                    ? "text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground",
                  item.isBackLink && "text-neutral-400 hover:text-neutral-200 border-b border-white/10 mb-2"
                )}
              >
                <item.icon className={cn("h-4 w-4", !sidebarOpen && "mx-auto")} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            </div>
            {/* Separador após o link de retorno */}
            {item.isBackLink && index === 0 && (
              <div className="my-2 border-b border-white/10" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
};
