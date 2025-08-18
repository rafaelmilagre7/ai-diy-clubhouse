/**
 * Hook para sincronização de permissões de roles
 * Garante que mudanças feitas no admin sejam refletidas instantaneamente
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { triggerGlobalPermissionSync } from '@/utils/roleSync';

export const useRolePermissionSync = () => {
  const queryClient = useQueryClient();

  /**
   * Sincroniza permissões de um role específico
   * Invalida todos os caches relacionados a permissões
   */
  const syncRolePermissions = useCallback(async (roleId: string, roleName: string) => {
    try {
      console.log('🔄 [ROLE-SYNC] Sincronizando permissões do role:', roleName);

      // Invalidar todos os caches de permissões
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-permissions'] }),
        queryClient.invalidateQueries({ queryKey: ['permissions'] }),
        queryClient.invalidateQueries({ queryKey: ['user-roles'] }),
        queryClient.invalidateQueries({ queryKey: ['profiles'] }),
        queryClient.invalidateQueries({ queryKey: ['feature-access'] }),
        queryClient.invalidateQueries({ queryKey: ['smart-feature-access'] }),
        queryClient.invalidateQueries({ queryKey: ['role-permissions', roleId] }),
      ]);

      // Verificar se há usuários com este role conectados
      const { data: usersWithRole, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role_id', roleId)
        .limit(5);

      if (!error && usersWithRole && usersWithRole.length > 0) {
        console.log(`👥 [ROLE-SYNC] ${usersWithRole.length} usuários serão afetados:`, 
          usersWithRole.map(u => u.email).join(', ')
        );
        
        toast.success(`✅ Permissões sincronizadas!`, {
          description: `${usersWithRole.length} usuários com role "${roleName}" afetados`
        });
      } else {
        toast.success(`✅ Permissões do role "${roleName}" sincronizadas!`);
      }

      // 🌐 Disparar evento global para todos os usuários conectados
      triggerGlobalPermissionSync(roleName);

      return true;
    } catch (error) {
      console.error('❌ [ROLE-SYNC] Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar permissões');
      return false;
    }
  }, [queryClient]);

  /**
   * Força sincronização global de todas as permissões
   * Usado quando há mudanças estruturais no sistema de permissões
   */
  const syncAllPermissions = useCallback(async () => {
    try {
      console.log('🌐 [ROLE-SYNC] Sincronização global de permissões iniciada...');

      // Invalidar absolutamente tudo relacionado a permissões
      queryClient.invalidateQueries({ predicate: (query) => {
        const key = query.queryKey[0] as string;
        return key?.includes('permission') || 
               key?.includes('role') || 
               key?.includes('profile') || 
               key?.includes('feature') ||
               key?.includes('access');
      }});

      toast.success('🌐 Sistema de permissões sincronizado globalmente!', {
        description: 'Todas as alterações foram aplicadas em tempo real'
      });

      // 🌐 Disparar evento global para sincronização completa
      triggerGlobalPermissionSync('system-wide');

      return true;
    } catch (error) {
      console.error('❌ [ROLE-SYNC] Erro na sincronização global:', error);
      toast.error('Erro na sincronização global');
      return false;
    }
  }, [queryClient]);

  return {
    syncRolePermissions,
    syncAllPermissions
  };
};