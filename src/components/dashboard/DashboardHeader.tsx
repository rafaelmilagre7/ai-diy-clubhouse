
import { useAuth } from "@/contexts/auth";
import { useProfileCache } from "@/hooks/useProfileCache";
import { useEffect } from "react";

interface DashboardHeaderProps {
  // Removidas as props desnecessárias para simplificar
}

export const DashboardHeader = () => {
  const { profile, user } = useAuth();
  const { invalidateCache } = useProfileCache();
  
  // Limpar cache na primeira renderização se necessário
  useEffect(() => {
    if (user?.id && (!profile?.user_roles || !profile?.name)) {
      console.log('🔄 [DASHBOARD] Invalidando cache devido a dados incompletos');
      invalidateCache(user.id);
    }
  }, [user?.id, profile, invalidateCache]);
  
  const firstName = profile?.name?.split(" ")[0] || profile?.user_roles?.name || "Membro";
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Bem-vindo, {firstName}!</h1>
      </div>
    </div>
  );
};
