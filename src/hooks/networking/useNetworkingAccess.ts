
import { useAuth } from '@/contexts/auth';

export function useNetworkingAccess() {
  const { profile } = useAuth();

  const hasAccess = profile?.role === 'admin' || profile?.role === 'formacao';
  
  let accessMessage = '';
  
  if (!hasAccess) {
    accessMessage = 'O Networking Inteligente é exclusivo para membros Club. Faça upgrade para conectar-se com outros empreendedores e expandir sua rede de negócios.';
  }

  return {
    hasAccess,
    accessMessage
  };
}
