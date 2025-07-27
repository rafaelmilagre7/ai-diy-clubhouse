
import { useLocation, Link } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Wrench, 
  Gift, 
  FileText, 
  Calendar, 
  UserCheck, 
  Mail, 
  MessageSquare,
  Stethoscope,
  GraduationCap,
  Shield,
  TestTube,
  Star,
  Settings2,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: BarChart3,
  },
  {
    title: "Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Ferramentas",
    href: "/admin/tools",
    icon: Wrench,
  },
  {
    title: "Benefícios",
    href: "/admin/benefits",
    icon: Gift,
  },
  {
    title: "Soluções",
    href: "/admin/solutions",
    icon: FileText,
  },
  {
    title: "Formação (LMS)",
    href: "/formacao",
    icon: GraduationCap,
  },
  {
    title: "NPS Analytics",
    href: "/admin/nps",
    icon: Star,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Sugestões",
    href: "/admin/suggestions",
    icon: MessageSquare,
  },
  {
    title: "Eventos",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Roles",
    href: "/admin/roles",
    icon: UserCheck,
  },
  {
    title: "Convites",
    href: "/admin/invites",
    icon: Mail,
  },
  {
    title: "Comunicações",
    href: "/admin/communications",
    icon: Mail,
  },
  {
    title: "Segurança",
    href: "/admin/security",
    icon: Shield,
  },
  {
    title: "WhatsApp Debug",
    href: "/admin/whatsapp-debug",
    icon: MessageSquare,
  },
  {
    title: "Pipedrive + Discord",
    href: "/admin/integrations-debug",
    icon: Zap,
  },
  {
    title: "Diagnósticos",
    href: "/admin/diagnostics",
    icon: Stethoscope,
  },
];

interface AdminSidebarNavProps {
  sidebarOpen: boolean;
}

export const AdminSidebarNav = ({ sidebarOpen }: AdminSidebarNavProps) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return location.pathname === href || 
      (href !== "/admin" && location.pathname.startsWith(href));
  };

  return (
    <nav className="flex-1 px-3 py-2">
      <div className="flex flex-col space-y-1">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-10 px-3 text-sm font-medium transition-all duration-200 rounded-lg group",
                !sidebarOpen && "justify-center px-2",
                active 
                  ? "bg-white/15 text-white shadow-lg border border-white/30" 
                  : "text-neutral-200 hover:text-white hover:bg-white/10 hover:shadow-md"
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};
