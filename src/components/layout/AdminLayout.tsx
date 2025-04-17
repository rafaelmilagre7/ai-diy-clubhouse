
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Navigate } from "react-router-dom";
import { AdminSidebar } from "./admin/AdminSidebar";
import { AdminContent } from "./admin/AdminContent";

/**
 * AdminLayout renders the layout structure for admin users
 * This includes the sidebar and content area
 */
const AdminLayout = () => {
  const { profile, isAdmin, user } = useAuth();
  
  // Se não for admin, redireciona para o dashboard
  if (!isAdmin && user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Default to showing sidebar on desktop, hiding on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Handle window resize to auto-adjust sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />
      <AdminContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
    </div>
  );
};

export default AdminLayout;
