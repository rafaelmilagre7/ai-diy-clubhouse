
import { useAuth } from '@/contexts/auth';

export function useNetworkingAccess() {
  const { profile } = useAuth();

  const hasAccess = () => {
    if (!profile) return false;
    
    // Apenas Admin e Formação (Club) têm acesso
    return profile.role === 'admin' || profile.role === 'formacao';
  };

  const getAccessMessage = () => {
    if (!profile) return 'Você precisa estar logado para acessar o networking.';
    
    if (profile.role === 'member') {
      return 'O networking está disponível apenas para membros Club e Admin. Faça upgrade para acessar esta funcionalidade.';
    }

    return '';
  };

  return {
    hasAccess: hasAccess(),
    accessMessage: getAccessMessage(),
    userRole: profile?.role || null
  };
}
