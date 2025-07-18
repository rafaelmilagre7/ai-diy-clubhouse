import { useAuth } from '@/contexts/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook seguro para verificação de admin
 * Garante que apenas usuários com role admin tenham acesso
 */
export const useSecureAdmin = (redirectOnFail = true) => {
  const { user, isLoading: authLoading } = useAuth();
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const navigate = useNavigate();

  const isLoading = authLoading || permissionsLoading;
  const isAdmin = permissions?.isAdmin || false;

  useEffect(() => {
    // Aguardar carregamento completo
    if (isLoading) return;

    // Se não há usuário, redirecionar para login
    if (!user) {
      if (redirectOnFail) {
        console.warn('[SECURE-ADMIN] No authenticated user - redirecting to login');
        navigate('/login', { replace: true });
      }
      return;
    }

    // Se não é admin, bloquear acesso
    if (!isAdmin) {
      console.warn('[SECURE-ADMIN] Unauthorized access attempt by:', user.email);
      
      if (redirectOnFail) {
        toast.error('Acesso negado. Você não tem permissão para acessar esta área.');
        navigate('/dashboard', { replace: true });
      }
      return;
    }

    console.log('[SECURE-ADMIN] Access granted to admin:', user.email);
  }, [user, isAdmin, isLoading, navigate, redirectOnFail]);

  return {
    isAdmin,
    isLoading,
    hasAccess: !isLoading && !!user && isAdmin
  };
};