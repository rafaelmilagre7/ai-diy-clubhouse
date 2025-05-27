
import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export function useNetworkingAccess() {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Verificar se tem permissão específica de networking
  const hasNetworkingPermission = hasPermission('networking.access');
  
  // Verificar se é membro club ou admin (fallback)
  const isMemberClub = profile?.role === 'membro_club' || profile?.role === 'admin';
  
  // Acesso liberado se tem permissão específica OU é membro club/admin
  const hasAccess = hasNetworkingPermission || isMemberClub;
  
  const accessMessage = !hasAccess 
    ? 'O Networking Inteligente é exclusivo para membros Club. Faça upgrade para conectar-se com outros empreendedores.'
    : '';

  return {
    hasAccess,
    accessMessage,
    isMemberClub,
    hasNetworkingPermission
  };
}
