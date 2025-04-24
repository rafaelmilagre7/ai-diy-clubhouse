
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import MemberLayout from "@/components/layout/MemberLayout";
import LoadingScreen from "@/components/common/LoadingScreen";

/**
 * MemberGuard - Aplica o layout de membros para usuários autenticados
 * A verificação principal de autenticação já é feita pelo AuthGuard
 */
const MemberGuard = () => {
  const { user, profile, isLoading } = useAuth();
  
  // Debug log
  console.log("MemberGuard:", { user: !!user, profile: !!profile, isLoading });
  
  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return <LoadingScreen message="Preparando seu dashboard..." />;
  }
  
  // Aplicar o layout para membros
  return (
    <MemberLayout>
      <Outlet />
    </MemberLayout>
  );
};

export default MemberGuard;
