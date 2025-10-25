
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
  Zap,
  ArrowLeftRight,
  Home,
  BookOpen,
  Webhook,
  Network,
  Palette,
  Layout,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationItem {
  title: string;
  href: string;
  icon: any;
  subItems?: { title: string; href: string; }[];
}

const navigationItems: NavigationItem[] = [
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
    title: "Acesso Soluções",
    href: "/admin/solution-overrides",
    icon: Shield,
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
    title: "Notificações",
    href: "/admin/notifications",
    icon: Bell,
    subItems: [
      { title: "Dashboard", href: "/admin/notifications" },
      { title: "Envio em Massa", href: "/admin/notifications/broadcast" },
    ],
  },
  {
    title: "Networking",
    href: "/admin/networking",
    icon: Network,
  },
  {
    title: "Builder",
    href: "/admin/builder",
    icon: Layout,
  },
  {
    title: "Mentorias",
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
    subItems: [
      { title: "Dashboard Emails", href: "/admin/communications/email-dashboard" },
      { title: "Logs de Email", href: "/admin/communications/email-logs" },
      { title: "Configurações", href: "/admin/communications/email-settings" },
    ],
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
    icon: ArrowLeftRight,
  },
  {
    title: "Webhooks Hubla",
    href: "/admin/hubla-webhooks",
    icon: Webhook,
  },
  {
    title: "Automações",
    href: "/admin/automations",
    icon: Zap,
  },
  {
    title: "Diagnósticos",
    href: "/admin/diagnostics",
    icon: Stethoscope,
  },
  {
    title: "Design System",
    href: "/admin/style-guide",
    icon: Palette,
  },
];

const platformNavigationItems = [
  {
    title: "Dashboard Membro",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Formação (LMS)",
    href: "/formacao",
    icon: BookOpen,
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
    <nav className="flex-1 px-sm py-sm flex flex-col">
      {/* Navegação Principal do Admin */}
      <div className="flex flex-col space-y-xs">
        {navigationItems.map((item) => {
          const active = isActive(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          
          return (
            <div key={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-sm h-10 px-sm text-sm font-medium transition-all duration-200 rounded-lg group",
                  !sidebarOpen && "justify-center px-sm",
                  active 
                    ? "bg-surface-elevated/50 text-foreground shadow-lg border border-border" 
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/30 hover:shadow-md"
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
              
              {/* Renderizar subitens se existirem */}
              {hasSubItems && sidebarOpen && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems!.map((subItem) => {
                    const subActive = isActive(subItem.href);
                    return (
                      <Button
                        key={subItem.href}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start h-8 px-2 text-xs transition-all duration-200 rounded-md",
                          subActive
                            ? "bg-surface-elevated/40 text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated/20"
                        )}
                        asChild
                      >
                        <Link to={subItem.href}>
                          {subItem.title}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Divisor */}
      <div className="my-md">
        <div className="h-px bg-border/30"></div>
      </div>

      {/* Navegação entre Plataformas */}
      <div className="space-y-xs">
        {sidebarOpen && (
          <div className="px-sm py-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Outras Plataformas
            </p>
          </div>
        )}
        
        {platformNavigationItems.map((item) => {
          const active = isActive(item.href);
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-sm h-10 px-sm text-sm font-medium transition-all duration-200 rounded-lg group",
                !sidebarOpen && "justify-center px-sm",
                active 
                  ? "bg-status-warning/20 text-status-warning border border-status-warning/30"
                  : "text-muted-foreground hover:text-status-warning hover:bg-status-warning/10"
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
