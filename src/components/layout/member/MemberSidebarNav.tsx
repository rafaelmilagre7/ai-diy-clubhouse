
import { memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Lightbulb, 
  BookOpen, 
  Users, 
  Settings,
  Trophy,
  Target,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: "Soluções",
    href: "/solutions",
    icon: Lightbulb,
    badge: "Em Breve",
  },
  {
    title: "Cursos",
    href: "/courses",
    icon: BookOpen,
    badge: null,
  },
  {
    title: "Comunidade",
    href: "/community",
    icon: Users,
    badge: "Beta",
  },
  {
    title: "Metas",
    href: "/goals",
    icon: Target,
    badge: null,
  },
  {
    title: "Eventos",
    href: "/events",
    icon: Calendar,
    badge: null,
  },
  {
    title: "Conquistas",
    href: "/achievements",
    icon: Trophy,
    badge: null,
  },
];

const secondaryItems = [
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    badge: null,
  },
];

export const MemberSidebarNav = memo<MemberSidebarNavProps>(({ sidebarOpen }) => {
  const location = useLocation();

  const NavItem = ({ item, isActive }: { item: typeof navigationItems[0], isActive: boolean }) => (
    <NavLink
      to={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-white/5 hover:text-white",
        isActive 
          ? "bg-primary/10 text-primary border-r-2 border-primary" 
          : "text-gray-300",
        !sidebarOpen && "justify-center px-3"
      )}
    >
      <item.icon className={cn(
        "shrink-0 transition-colors",
        isActive ? "text-primary" : "text-gray-400 group-hover:text-white",
        sidebarOpen ? "h-5 w-5" : "h-6 w-6"
      )} />
      
      {sidebarOpen && (
        <>
          <span className="truncate">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" size="xs" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
      
      {!sidebarOpen && item.badge && (
        <div className="absolute left-full ml-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {item.title}
        </div>
      )}
    </NavLink>
  );

  return (
    <nav className="flex flex-col h-full px-3 py-4">
      {/* Navegação Principal */}
      <div className="space-y-1 flex-1">
        {sidebarOpen && (
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Principal
            </h2>
          </div>
        )}
        
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          
          return (
            <NavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </div>

      {/* Navegação Secundária */}
      <div className="border-t border-white/10 pt-4 mt-4">
        {sidebarOpen && (
          <div className="px-3 py-2 mb-1">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Conta
            </h2>
          </div>
        )}
        
        {secondaryItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavItem key={item.href} item={item} isActive={isActive} />
          );
        })}
      </div>
    </nav>
  );
});

MemberSidebarNav.displayName = 'MemberSidebarNav';
