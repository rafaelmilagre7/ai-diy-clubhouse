
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { Navigate, useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";

const Layout = () => {
  const { user, profile, signOut, isAdmin, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Verificar user role quando o componente é montado e quando profile muda
  useEffect(() => {
    if (profile && profile.role === 'admin') {
      console.log("Layout useEffect: Usuário é admin, redirecionando para /admin", { 
        profileRole: profile.role,
        isAdmin: profile.role === 'admin'
      });
      navigate('/admin', { replace: true });
    } else {
      console.log("Layout useEffect: Confirmando que o usuário é membro", {
        profileRole: profile?.role,
        isAdmin: profile?.role === 'admin'
      });
    }
  }, [profile, navigate]);

  // Mostrar tela de carregamento enquanto verifica a sessão
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se o usuário não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário for admin, redirecionar para o layout admin
  // (isso é feito também no useEffect, mas mantemos aqui como dupla segurança)
  if (isAdmin) {
    // Adicionar console.log para debug
    console.log("Layout render: Usuário é admin, redirecionando para /admin", { 
      profileRole: profile?.role, 
      isAdmin 
    });
    return <Navigate to="/admin" replace />;
  }

  // Adicionar console.log para debug do perfil de membro
  console.log("Layout render: Usuário é membro, permanecendo na área de membro", { 
    profileRole: profile?.role, 
    isAdmin 
  });

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
