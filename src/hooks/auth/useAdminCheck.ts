import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface AdminCheckResult {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook robusto para verificação de permissões de admin
 * Inclui retry automático e logs detalhados
 */
export const useAdminCheck = (): AdminCheckResult => {
  const { user, profile, isAdmin: contextIsAdmin, isLoading: contextIsLoading } = useAuth();
  const [localIsAdmin, setLocalIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkAdminStatus = useCallback(async () => {
    if (!user?.id) {
      setLocalIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar diretamente do banco para ter certeza
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          role_id,
          user_roles:role_id (
            name,
            permissions
          )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLocalIsAdmin(false);
        return;
      }

      // user_roles pode ser array ou objeto dependendo da query
      const userRoles = Array.isArray(profileData?.user_roles) 
        ? profileData.user_roles[0] 
        : profileData?.user_roles;
      
      const roleName = userRoles?.name;
      const permissions = userRoles?.permissions || {};
      const isAdminResult = roleName === 'admin' || permissions.all === true;

      setLocalIsAdmin(isAdminResult);
    } catch (err) {
      console.error('❌ [useAdminCheck] Erro na verificação:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setLocalIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, contextIsAdmin]);

  // Executar verificação quando usuário mudar ou em retry
  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus, retryCount]);

  // Sincronizar com contexto quando disponível
  useEffect(() => {
    if (!contextIsLoading && profile) {
      setLocalIsAdmin(contextIsAdmin);
      setIsLoading(false);
    }
  }, [contextIsAdmin, contextIsLoading, profile]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  return {
    isAdmin: localIsAdmin,
    isLoading: isLoading || contextIsLoading,
    error,
    retry
  };
};
