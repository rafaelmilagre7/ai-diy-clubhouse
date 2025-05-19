
import { UserMenu } from "@/components/layout/shared/UserMenu";
import { useAuth } from "@/contexts/auth";
import { getUserDisplayName } from "@/utils/auth/adminUtils";
import { useEffect, useState } from "react";

interface MemberUserMenuProps {
  sidebarOpen: boolean;
  signOut: () => Promise<void>;
}

export const MemberUserMenu = ({ sidebarOpen, signOut }: MemberUserMenuProps) => {
  const { user, profile } = useAuth();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Obter nome do usuário usando função utilitária centralizada
    const displayName = getUserDisplayName(user, profile);
    setUserName(displayName);
    
    // Obter email
    setUserEmail(profile?.email || user?.email || "");
    
    // Obter URL do avatar
    setAvatarUrl(profile?.avatar_url || user?.user_metadata?.avatar_url);
    
    console.log("MemberUserMenu - Dados do usuário:", {
      displayName,
      email: profile?.email || user?.email,
      avatarUrl: profile?.avatar_url || user?.user_metadata?.avatar_url
    });
  }, [user, profile]);
  
  // Obter iniciais do nome para exibir quando não há avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };
  
  return (
    <UserMenu
      sidebarOpen={sidebarOpen}
      profileName={userName}
      profileEmail={userEmail}
      profileAvatar={avatarUrl}
      getInitials={getInitials}
      signOut={signOut}
    />
  );
};
