
import { useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/auth";
import { MemberSidebar } from "./member/MemberSidebar";
import { MemberContent } from "./member/MemberContent";

/**
 * MemberLayout renders the layout structure for member users
 * This includes the sidebar and content area
 */
const MemberLayout = ({ children }: { children: ReactNode }) => {
  const { profile, signOut } = useAuth();
  // Default to showing sidebar on desktop, hiding on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  // Handle window resize to auto-adjust sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // Certifique-se de que o sidebar esteja aberto no desktop
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Chamar imediatamente para definir o estado inicial correto
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Adicionando log para depuração
  console.log("MemberLayout renderizado:", { 
    profileName: profile?.name,
    profileEmail: profile?.email,
    sidebarOpen 
  });

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
      >
        {children}
      </MemberContent>
    </div>
  );
};

export default MemberLayout;
