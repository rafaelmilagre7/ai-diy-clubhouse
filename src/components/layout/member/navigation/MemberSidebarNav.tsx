import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart2, 
  Lightbulb, 
  Wrench, 
  User, 
  Gift, 
  Award,
  MessageSquarePlus,
  Calendar,
  Users
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: BarChart2,
    href: "/dashboard",
  },
  {
    title: "Soluções",
    icon: Lightbulb,
    href: "/solutions",
  },
  {
    title: "Ferramentas",
    icon: Wrench,
    href: "/tools",
  },
  {
    title: "Benefícios",
    icon: Gift,
    href: "/benefits",
  },
  {
    title: "Conquistas",
    icon: Award,
    href: "/achievements",
  },
  {
    title: "Eventos",
    icon: Calendar,
    href: "/events",
  },
  {
    title: "Sugestões",
    icon: MessageSquarePlus,
    href: "/suggestions",
  },
  {
    title: "Networking",
    icon: Users,
    href: "/networking",
  },
];

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: MemberSidebarNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="flex-1 px-4 py-5">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className={cn(
                "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent",
                currentPath === item.href || currentPath.startsWith(`${item.href}/`)
                  ? "bg-accent/50 text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
                !sidebarOpen && "justify-center px-2"
              )}
            >
              <item.icon className={cn("h-5 w-5", !sidebarOpen && "h-6 w-6")} />
              {sidebarOpen && <span className="ml-3">{item.title}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
