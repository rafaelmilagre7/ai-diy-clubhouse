/**
 * Hook para detectar mudanças de permissões em tempo real
 * Força atualização quando admin altera permissões de roles
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { useGlobalPermissionListener } from '@/utils/roleSync';
import { getUserRoleName } from '@/lib/supabase/types';
import { toast } from 'sonner';

export const usePermissionListener = () => {
  const queryClient = useQueryClient();
  const { profile, user } = useAuth();
  const userRole = getUserRoleName(profile);

  useEffect(() => {
    if (!user?.id) return;

    // Configurar listener para mudanças de permissões
    const cleanup = useGlobalPermissionListener(async (syncEvent) => {
      console.log('🔄 [PERMISSION-LISTENER] Detectada mudança de permissões:', syncEvent);

      // Verificar se esta mudança afeta o usuário atual
      const isAffected = syncEvent.roleAffected === userRole || 
                        syncEvent.roleAffected === 'system-wide';

      if (isAffected) {
        console.log(`🎯 [PERMISSION-LISTENER] Usuário afetado pela mudança no role: ${syncEvent.roleAffected}`);
        
        // Invalidar caches relacionados a permissões
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['user-permissions'] }),
          queryClient.invalidateQueries({ queryKey: ['permissions'] }),
          queryClient.invalidateQueries({ queryKey: ['profiles'] }),
          queryClient.invalidateQueries({ queryKey: ['feature-access'] }),
          queryClient.invalidateQueries({ queryKey: ['smart-feature-access'] }),
        ]);

        // Mostrar notificação discreta para o usuário
        if (syncEvent.roleAffected !== 'system-wide') {
          toast.info('⚡ Suas permissões foram atualizadas', {
            description: 'As mudanças já estão ativas na plataforma',
            duration: 3000,
          });
        }

        // Log para debug
        console.log('✅ [PERMISSION-LISTENER] Cache invalidado para usuário:', {
          userId: user.id.substring(0, 8) + '***',
          userRole,
          syncEvent
        });
      }
    });

    return cleanup;
  }, [user?.id, userRole, queryClient]);
};