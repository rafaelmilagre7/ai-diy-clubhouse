
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { Navigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";

const Layout = () => {
  const { user, profile, signOut, isAdmin, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mostrar tela de carregamento enquanto verifica a sessão
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se o usuário não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário for admin, redirecionar para o layout admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MemberSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        profileName={profile?.name}
        profileEmail={profile?.email}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
        signOut={signOut}
      />
      <MemberContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />
    </div>
  );
};

export default Layout;
