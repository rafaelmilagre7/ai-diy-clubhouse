import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  ChevronRight,
  LogOut,
  Menu,
  X,
  User,
  BarChart2,
  Wrench,
  Lightbulb,
  MessageSquare,
  Award,
  Map
} from "lucide-react";

interface MemberSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar?: string;
  getInitials: (name: string | null) => string;
  signOut: () => void;
}

export const MemberSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  profileName,
  profileEmail,
  profileAvatar,
  getInitials,
  signOut
}: MemberSidebarProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const navLinks = [
    {
      name: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard",
    },
    {
      name: "Onboarding",
      icon: <Map size={20} />,
      path: "/onboarding",
    },
    {
      name: "Soluções",
      icon: <Lightbulb size={20} />,
      path: "/solutions",
    },
    {
      name: "Trilha",
      icon: <BarChart2 size={20} />,
      path: "/implementation-trail",
    },
    {
      name: "Ferramentas",
      icon: <Wrench size={20} />,
      path: "/tools",
    },
    {
      name: "Sugestões",
      icon: <MessageSquare size={20} />,
      path: "/suggestions",
    },
    {
      name: "Conquistas",
      icon: <Award size={20} />,
      path: "/achievements",
    },
    {
      name: "Perfil",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar principal */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20",
          "flex flex-col"
        )}
        animate={{ width: sidebarOpen ? "16rem" : "5rem" }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Cabeçalho com botão de toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/" className="flex items-center text-xl font-semibold">
            <img src="/logo.svg" alt="VIVER DE IA Club" className="h-8 w-auto mr-2" />
            {sidebarOpen && <span>VIVER DE IA</span>}
          </Link>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Links de navegação */}
        <nav className="flex flex-col flex-grow px-4 pb-4 mt-6 overflow-y-auto">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center p-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    )
                  }
                >
                  <div className="flex items-center flex-1">
                    <span className="flex items-center justify-center w-6">
                      {link.icon}
                    </span>
                    {sidebarOpen && (
                      <span className="ml-3 text-sm font-medium transition-all duration-200">
                        {link.name}
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé com informações do usuário e botão de logout */}
        <div className="py-4 px-4 border-t">
          {/* Informações do usuário */}
          <div className="flex items-center space-x-3 mb-3">
            {profileAvatar ? (
              <img
                src={profileAvatar}
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-semibold">{getInitials(profileName)}</span>
              </div>
            )}
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{profileName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{profileEmail}</span>
              </div>
            )}
          </div>

          {/* Botão de logout */}
          {sidebarOpen && (
            <button
              onClick={signOut}
              className="flex items-center w-full p-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <LogOut size={20} className="mr-2" />
              Sair
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
