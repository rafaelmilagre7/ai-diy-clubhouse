import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, BookOpen, Wrench, Bell, Settings, Lightbulb, GraduationCap, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/auth";

export const MemberSidebarNav = ({ sidebarOpen, className }: {
  sidebarOpen: boolean,
  className?: string
}) => {
  const { profile } = useAuth();

  const navItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      end: true, 
      icon: Home 
    },
    { 
      name: "Soluções", 
      path: "/solutions", 
      icon: Lightbulb 
    },
    { 
      name: "Cursos", 
      path: "/learning", 
      icon: GraduationCap 
    },
    { 
      name: "Ferramentas", 
      path: "/tools", 
      icon: Wrench 
    },
    { 
      name: "Indicações", 
      path: "/referrals", 
      icon: UserPlus 
    },
    { 
      name: "Notificações", 
      path: "/notifications", 
      icon: Bell 
    },
    { 
      name: "Perfil", 
      path: "/profile", 
      icon: Settings 
    },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className={cn("px-2 lg:px-4", className)}>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-x-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          </li>
        ))}
        
        {isAdmin && (
          <li>
            <NavLink
              to="/formacao"
              className={({ isActive }) =>
                cn(
                  "mt-4 flex items-center gap-x-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                )
              }
            >
              <BookOpen className="h-4 w-4" />
              {sidebarOpen && <span>Área de Formação</span>}
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};
