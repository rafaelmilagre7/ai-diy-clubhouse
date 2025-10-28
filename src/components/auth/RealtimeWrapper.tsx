import { ReactNode } from 'react';
import { useRoleChangeRealtime } from '@/hooks/admin/useRoleChangeRealtime';

interface RealtimeWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper que ativa listeners realtime DEPOIS que AuthContext está disponível
 * Previne erro de circular dependency ao chamar useAuth() antes do Provider montar
 */
export const RealtimeWrapper = ({ children }: RealtimeWrapperProps) => {
  // ✅ Agora funciona porque está DENTRO de um componente filho do AuthProvider
  useRoleChangeRealtime();
  
  return <>{children}</>;
};
