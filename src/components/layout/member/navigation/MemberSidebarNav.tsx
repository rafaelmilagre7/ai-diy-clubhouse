
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Lightbulb, 
  Wrench, 
  Gift, 
  MessageCircle, 
  Award, 
  HelpCircle 
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MemberSidebarNavProps {
  sidebarOpen: boolean;
}

export const MemberSidebarNav = ({ sidebarOpen }: MemberSidebarNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Definição de itens do menu principal
  const navItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: currentPath === "/dashboard"
    },
    {
      title: "Soluções",
      icon: Lightbulb,
      href: "/solutions",
      active: currentPath.includes("/solution") || currentPath === "/solutions"
    },
    {
      title: "Ferramentas",
      icon: Wrench,
      href: "/tools",
      active: currentPath.includes("/tools")
    },
    {
      title: "Benefícios",
      icon: Gift,
      href: "/benefits",
      active: currentPath === "/benefits"
    },
    {
      title: "Sugestões",
      icon: MessageCircle,
      href: "/suggestions",
      active: currentPath.includes("/suggestions")
    },
    {
      title: "Conquistas",
      icon: Award,
      href: "/achievements",
      active: currentPath === "/achievements"
    },
  ];

  // Item separado para suporte
  const supportItem = {
    title: "Suporte",
    icon: HelpCircle,
    href: "https://wa.me/5511999999999", // Atualizar com o número real
    external: true
  };

  return (
    <div className="flex flex-col overflow-y-auto py-4 flex-1">
      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.title}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              item.active
                ? "bg-[#0ABAB5]/10 text-[#0ABAB5] font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <item.icon size={18} />
            {sidebarOpen && <span>{item.title}</span>}
          </Link>
        ))}
        
        {/* Item de suporte */}
        <a
          href={supportItem.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors mt-auto"
        >
          <supportItem.icon size={18} />
          {sidebarOpen && <span>{supportItem.title}</span>}
        </a>
      </nav>
    </div>
  );
};
