
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile, getUserRoleName } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { usePermissions, Role } from '@/hooks/auth/usePermissions';

// CORREÇÃO CRÍTICA: Error Boundary para operações Supabase
class SupabaseErrorHandler {
  static handleError(error: any, operation: string): never {
    console.error(`❌ [USERS] Erro em ${operation}:`, error);
    
    // Categorizar tipos de erro
    if (error?.code === 'PGRST116') {
      throw new Error(`Recurso não encontrado durante ${operation}`);
    }
    
    if (error?.message?.includes('network')) {
      throw new Error(`Erro de rede durante ${operation}. Verifique sua conexão.`);
    }
    
    if (error?.message?.includes('timeout')) {
      throw new Error(`Timeout durante ${operation}. Tente novamente.`);
    }
    
    if (error?.code?.startsWith('PGRST')) {
      throw new Error(`Erro de banco de dados durante ${operation}: ${error.message}`);
    }
    
    // Erro genérico
    throw new Error(`Erro inesperado durante ${operation}: ${error.message || 'Erro desconhecido'}`);
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 [USERS] Tentativa ${attempt}/${maxRetries} para ${operationName}`);
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ [USERS] Tentativa ${attempt} falhou para ${operationName}:`, error);
        
        // Se é o último retry ou erro não é de rede, falhar imediatamente
        if (attempt === maxRetries || !this.isRetryableError(error)) {
          break;
        }
        
        // Aguardar antes do próximo retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    this.handleError(lastError, operationName);
  }

  static isRetryableError(error: any): boolean {
    // Erros de rede e timeout são retryable
    const errorMessage = error?.message?.toLowerCase() || '';
    return errorMessage.includes('network') || 
           errorMessage.includes('timeout') || 
           errorMessage.includes('fetch');
  }
}

export function useUsers() {
  const { user, isAdmin } = useAuth();
  const { hasPermission } = usePermissions();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Verificações de permissão
  const canManageUsers = isAdmin || hasPermission('users.manage');
  const canAssignRoles = isAdmin || hasPermission('roles.assign');
  const canDeleteUsers = isAdmin || hasPermission('users.delete');
  const canResetPasswords = isAdmin || hasPermission('users.reset_password');

  const fetchUsers = useCallback(async () => {
    if (!canManageUsers) {
      console.warn('Usuário não tem permissão para gerenciar usuários');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // CORREÇÃO CRÍTICA: Usar error handler com retry
      await SupabaseErrorHandler.executeWithRetry(async () => {
        console.log(`🔍 [USERS] Buscando usuários com filtro: "${searchQuery}"`);
        
        // Query com join para user_roles
        let query = supabase
          .from('profiles')
          .select(`
            id,
            email,
            name,
            avatar_url,
            company_name,
            industry,
            created_at,
            role_id,
            user_roles:role_id (
              id,
              name,
              description,
              permissions,
              is_system
            )
          `)
          .order('created_at', { ascending: false });

        // Aplicar filtro de busca se houver
        if (searchQuery.trim()) {
          query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,company_name.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        // Mapear dados para o formato UserProfile
        const mappedUsers: UserProfile[] = (data || []).map(user => ({
          id: user.id,
          email: user.email || '',
          name: user.name,
          avatar_url: user.avatar_url,
          company_name: user.company_name,
          industry: user.industry,
          created_at: user.created_at,
          role_id: user.role_id,
          user_roles: user.user_roles as any,
          onboarding_completed: false,
          onboarding_completed_at: null
        }));

        setUsers(mappedUsers);
        console.log(`✅ [USERS] ${mappedUsers.length} usuários carregados com sucesso`);
        
      }, 'buscar usuários');

    } catch (err: any) {
      console.error('❌ [USERS] Erro crítico ao buscar usuários:', err);
      setError(err);
      
      // Toast de erro amigável
      toast.error('Erro ao carregar usuários', {
        description: err.message || 'Não foi possível carregar a lista de usuários. Tente novamente.',
        action: {
          label: 'Tentar novamente',
          onClick: () => fetchUsers()
        }
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [canManageUsers, searchQuery]);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      // CORREÇÃO CRÍTICA: Usar error handler para buscar roles
      await SupabaseErrorHandler.executeWithRetry(async () => {
        console.log('🔍 [USERS] Buscando roles disponíveis');
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('*')
          .order('name');

        if (error) {
          throw error;
        }

        setAvailableRoles(data || []);
        console.log(`✅ [USERS] ${data?.length || 0} roles carregadas com sucesso`);
        
      }, 'buscar roles disponíveis');

    } catch (err: any) {
      console.error('❌ [USERS] Erro ao buscar roles:', err);
      toast.error('Erro ao carregar roles', {
        description: err.message || 'Não foi possível carregar as roles disponíveis.'
      });
    }
  }, []);

  // Debounce search com error handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (canManageUsers) {
        fetchUsers().catch(error => {
          console.error('❌ [USERS] Erro no debounce de busca:', error);
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchUsers, canManageUsers]);

  // Carregar roles disponíveis com error handling
  useEffect(() => {
    if (canAssignRoles) {
      fetchAvailableRoles().catch(error => {
        console.error('❌ [USERS] Erro ao carregar roles iniciais:', error);
      });
    }
  }, [canAssignRoles, fetchAvailableRoles]);

  // Função para refresh manual com error handling melhorado
  const handleRefresh = useCallback(() => {
    console.log('🔄 [USERS] Refresh manual iniciado');
    setIsRefreshing(true);
    fetchUsers().catch(error => {
      console.error('❌ [USERS] Erro no refresh manual:', error);
      setIsRefreshing(false);
    });
  }, [fetchUsers]);

  return {
    users,
    availableRoles,
    loading,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    fetchUsers: handleRefresh,
    canManageUsers,
    canAssignRoles,
    canDeleteUsers,
    canResetPasswords,
    error
  };
}
