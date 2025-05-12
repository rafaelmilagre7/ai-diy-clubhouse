
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";

/**
 * MemberLayout renderiza a estrutura de layout para usuários membros
 * Isso inclui a barra lateral e a área de conteúdo
 */
const MemberLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile, signOut } = useAuth();
  
  // Estado para controlar a visibilidade da barra lateral
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Recuperar estado do localStorage, padrão é aberto em desktop
    const savedState = localStorage.getItem("sidebarOpen");
    console.log("Estado inicial da sidebar recuperado:", savedState);
    return savedState !== null ? savedState === "true" : window.innerWidth >= 768;
  });

  // Efeito para persistir o estado da barra lateral
  useEffect(() => {
    console.log("Persistindo estado da sidebar:", sidebarOpen);
    localStorage.setItem("sidebarOpen", String(sidebarOpen));
  }, [sidebarOpen]);

  // Função para obter iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Detectar tamanho de tela e ajustar barra lateral em dispositivos móveis
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      console.log("Detectado redimensionamento:", { isMobile, width: window.innerWidth });
      
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    // Executar verificação inicial
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sidebarOpen]);

  // Forçar o tema escuro 
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0F111A] overflow-hidden">
      {/* Barra lateral garantida para ser renderizada sempre */}
      <MemberSidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        profileName={profile?.name || null}
        profileEmail={profile?.email || null}
        profileAvatar={profile?.avatar_url}
        getInitials={getInitials}
        signOut={signOut}
      />
      
      {/* Conteúdo principal */}
      <MemberContent 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      >
        {children}
      </MemberContent>
    </div>
  );
};

export default MemberLayout;
