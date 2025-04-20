
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";
import { toast } from "sonner";

/**
 * MemberLayout renders the layout structure for member users
 * This includes the sidebar and content area
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  
  // Usar localStorage para persistir o estado do sidebar entre navegações
  const storedSidebarState = localStorage.getItem("sidebarOpen");
  const defaultSidebarState = storedSidebarState !== null ? 
    storedSidebarState === "true" : 
    window.innerWidth >= 768; // Default aberto em desktop, fechado em mobile
  
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarState);

  // Função para atualizar o estado do sidebar e salvar no localStorage
  const handleSidebarToggle = (open: boolean) => {
    setSidebarOpen(open);
    localStorage.setItem("sidebarOpen", open.toString());
  };

  // Detectar tamanho de tela e ajustar sidebar
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      
      // Em mobile com sidebar aberto, fechar o sidebar
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
        localStorage.setItem("sidebarOpen", "false");
      }
    };

    // Executar na montagem
    handleResize();
    
    // Adicionar listener para resize
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Log para depuração
  console.log("MemberLayout renderizado:", { 
    profileName: profile?.name,
    profileEmail: profile?.email,
    sidebarOpen,
    windowWidth: window.innerWidth
  });

  if (!profile) {
    console.log("Perfil não encontrado no MemberLayout");
    toast.error("Erro ao carregar perfil. Tente fazer login novamente.");
  }

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Sidebar sempre renderizado com visibilidade garantida */}
      <MemberSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={handleSidebarToggle}
        profileName={profile?.name}
        profileEmail={profile?.email}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
        signOut={signOut}
      />
      
      {/* Conteúdo principal */}
      <MemberContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={handleSidebarToggle} 
      >
        {children}
      </MemberContent>
    </div>
  );
};

export default MemberLayout;
