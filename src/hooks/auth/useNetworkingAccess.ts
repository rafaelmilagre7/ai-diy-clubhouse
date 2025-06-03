
import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';

export function useNetworkingAccess() {
  const { profile } = useAuth();
  const { hasPermission } = usePermissions();
  
  // Verificar se tem permissão específica de networking
  const hasNetworkingPermission = hasPermission('networking.access');
  
  // Verificar se é admin (que tem acesso total)
  const isAdmin = profile?.role === 'admin';
  
  // Para agora, considerar que membros regulares com permissão específica têm acesso
  // Quando implementarmos o sistema de roles expandido (membro_club), será atualizado
  const hasAccess = hasNetworkingPermission || isAdmin;
  
  const accessMessage = !hasAccess 
    ? 'O Networking Inteligente é exclusivo para membros Club. Faça upgrade para conectar-se com outros empreendedores.'
    : '';

  return {
    hasAccess,
    accessMessage,
    isAdmin,
    hasNetworkingPermission
  };
}
