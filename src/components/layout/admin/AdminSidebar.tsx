
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import { AdminSidebarNav } from './AdminSidebarNav';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "w-64" : "w-20"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Cabeçalho com botão de toggle */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <NavLink to="/admin" className="flex items-center text-xl font-semibold">
            {sidebarOpen && <span>Admin Panel</span>}
          </NavLink>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        
        {/* Links de navegação */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminSidebarNav expanded={sidebarOpen} />
        </div>
      </aside>
    </>
  );
};
